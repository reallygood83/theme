import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import { Opinion } from '@/models/Opinion'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'
    
    await connectMongoDB()
    
    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(2020, 0, 1) // All time
    }

    // Get all opinions in the date range
    const opinions = await Opinion.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 })

    // Calculate basic statistics
    const totalOpinions = opinions.length
    const pendingOpinions = opinions.filter(op => op.status === 'pending').length
    const feedbackGiven = opinions.filter(op => op.status === 'feedback_given').length
    const reviewedOpinions = opinions.filter(op => op.status === 'reviewed').length

    // Calculate average response time (in hours)
    const opinionsWithFeedback = opinions.filter(op => 
      op.status !== 'pending' && op.updatedAt && op.createdAt
    )
    
    let avgResponseTime = 0
    if (opinionsWithFeedback.length > 0) {
      const totalResponseTime = opinionsWithFeedback.reduce((sum, op) => {
        const responseTime = (new Date(op.updatedAt).getTime() - new Date(op.createdAt).getTime()) / (1000 * 60 * 60)
        return sum + responseTime
      }, 0)
      avgResponseTime = Math.round(totalResponseTime / opinionsWithFeedback.length * 10) / 10
    }

    // Calculate top students
    const studentStats: { [key: string]: { name: string; class: string; count: number; totalLength: number } } = {}
    
    opinions.forEach(opinion => {
      const key = `${opinion.studentName}_${opinion.studentClass}`
      if (!studentStats[key]) {
        studentStats[key] = {
          name: opinion.studentName,
          class: opinion.studentClass,
          count: 0,
          totalLength: 0
        }
      }
      studentStats[key].count++
      studentStats[key].totalLength += opinion.content.length
    })

    const topStudents = Object.values(studentStats)
      .map(student => ({
        name: student.name,
        class: student.class,
        opinionCount: student.count,
        avgLength: Math.round(student.totalLength / student.count)
      }))
      .sort((a, b) => b.opinionCount - a.opinionCount)
      .slice(0, 10)

    // Calculate topic distribution
    const topicStats: { [key: string]: number } = {}
    opinions.forEach(opinion => {
      const topic = opinion.topic || '기타'
      topicStats[topic] = (topicStats[topic] || 0) + 1
    })

    const topicDistribution = Object.entries(topicStats)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / totalOpinions) * 100 * 10) / 10
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    // Calculate daily activity (last 30 days)
    const dailyActivity: { [key: string]: number } = {}
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    opinions
      .filter(op => new Date(op.createdAt) >= last30Days)
      .forEach(opinion => {
        const dateKey = new Date(opinion.createdAt).toISOString().split('T')[0]
        dailyActivity[dateKey] = (dailyActivity[dateKey] || 0) + 1
      })

    const dailyData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
      const dateKey = date.toISOString().split('T')[0]
      return {
        date: dateKey,
        count: dailyActivity[dateKey] || 0
      }
    })

    // Calculate monthly trends (last 12 months)
    const monthlyActivity: { [key: string]: number } = {}
    const last12Months = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    
    opinions
      .filter(op => new Date(op.createdAt) >= last12Months)
      .forEach(opinion => {
        const date = new Date(opinion.createdAt)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthlyActivity[monthKey] = (monthlyActivity[monthKey] || 0) + 1
      })

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      return {
        month: monthKey,
        count: monthlyActivity[monthKey] || 0
      }
    })

    // Calculate keyword analysis
    const keywords: { [key: string]: { count: number; sentiment: 'positive' | 'neutral' | 'negative' } } = {}
    const positiveWords = ['좋다', '훌륭하다', '최고', '완벽', '우수', '뛰어나다', '멋지다', '감사', '행복', '성공']
    const negativeWords = ['나쁘다', '최악', '실망', '부족', '문제', '어렵다', '힘들다', '걱정', '실패', '불만']
    
    opinions.forEach(opinion => {
      const words = opinion.content.split(/\s+/)
      words.forEach((word: string) => {
        const cleanWord = word.replace(/[^\w가-힣]/g, '').toLowerCase()
        if (cleanWord.length >= 2) {
          if (!keywords[cleanWord]) {
            keywords[cleanWord] = { 
              count: 0, 
              sentiment: positiveWords.includes(cleanWord) ? 'positive' :
                        negativeWords.includes(cleanWord) ? 'negative' : 'neutral'
            }
          }
          keywords[cleanWord].count++
        }
      })
    })

    const topKeywords = Object.entries(keywords)
      .filter(([word, data]) => data.count >= 2)
      .map(([word, data]) => ({ word, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    // Calculate engagement metrics
    const engagementMetrics = {
      participationRate: totalOpinions > 0 ? Math.round((feedbackGiven / totalOpinions) * 100 * 10) / 10 : 0,
      avgOpinionLength: totalOpinions > 0 ? Math.round(opinions.reduce((sum, op) => sum + op.content.length, 0) / totalOpinions) : 0,
      feedbackRate: totalOpinions > 0 ? Math.round((feedbackGiven / totalOpinions) * 100 * 10) / 10 : 0,
      reviewCompletionRate: feedbackGiven > 0 ? Math.round((reviewedOpinions / feedbackGiven) * 100 * 10) / 10 : 0
    }

    const statistics = {
      totalOpinions,
      pendingOpinions,
      feedbackGiven,
      reviewedOpinions,
      avgResponseTime,
      topStudents,
      topicDistribution,
      dailyActivity: dailyData,
      monthlyTrends: monthlyData,
      keywordAnalysis: topKeywords,
      engagementMetrics,
      period,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: statistics
    })

  } catch (error) {
    console.error('Error fetching debate statistics:', error)
    return NextResponse.json(
      { success: false, error: '통계 데이터를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}