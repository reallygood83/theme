import { database, firestore } from './firebase'
import { collection, getDocs } from 'firebase/firestore'
import { ref, get } from 'firebase/database'

export type Nation = {
  id: string
  name: string
  nameEn: string
  flag: string
  type: 'combat' | 'medical' | 'material'
  region: string
  deploymentSize?: number
  deploymentPeriod?: {
    start: string
    end: string
  }
  casualties?: {
    killed: number
    wounded: number
    missing: number
  }
  background?: string
  koreanRelations?: string
  mainActivities?: string[]
  culture?: string
  languages?: string[]
}

// Fallback nations data in case Firebase is not available
const fallbackNationsData: Nation[] = [
  {
    id: 'usa',
    name: '미국',
    nameEn: 'United States of America',
    flag: '/images/flags/usa.png',
    type: 'combat',
    region: 'north-america',
    deploymentSize: 1789000,
    deploymentPeriod: {
      start: '1950-06-27',
      end: '1953-07-27'
    },
    casualties: {
      killed: 36574,
      wounded: 103284,
      missing: 8177
    },
    languages: ['en'],
    background: '미국은 UN 안전보장이사회 결의안에 따라 가장 먼저 한국전에 참전했으며, 가장 많은 병력을 파견했습니다. 맥아더 장군의 인천상륙작전을 포함하여 주요 전투에서 중요한 역할을 했습니다.',
    mainActivities: [
      '인천상륙작전 주도',
      '낙동강 방어선 구축',
      '진지한 휴전 협상 추진',
      '한국 재건을 위한 경제 원조 제공'
    ],
    koreanRelations: '전쟁 이후 한미동맹을 체결하여 현재까지 한국의 안보를 보장하는 핵심 동맹국이 되었습니다. 경제, 문화, 교육 등 다양한 분야에서 긴밀한 협력 관계를 유지하고 있습니다.'
  },
  {
    id: 'uk',
    name: '영국',
    nameEn: 'United Kingdom',
    flag: '/images/flags/uk.png',
    type: 'combat',
    region: 'europe',
    deploymentSize: 14198,
    deploymentPeriod: {
      start: '1950-08-29',
      end: '1953-07-27'
    },
    casualties: {
      killed: 1078,
      wounded: 2674,
      missing: 179
    },
    languages: ['en'],
    background: '영국은 미국 다음으로 한국전에 많은 병력을 파견한 서방국가였습니다. 영연방 부대의 일원으로 참전하여 임진강 전투, 가평전투 등에서 중요한 역할을 수행했습니다.',
    mainActivities: [
      '임진강 전투 참전',
      '가평전투 참전',
      '해상 봉쇄 작전 지원',
      '의료 지원'
    ],
    koreanRelations: '전쟁 이후 한국과 영국은 외교, 경제, 문화 등 다양한 분야에서 협력 관계를 구축해왔습니다. 2010년대에는 양국 간 교역량이 크게 증가했습니다.'
  },
  {
    id: 'turkey',
    name: '터키',
    nameEn: 'Turkey',
    flag: '/images/flags/turkey.png',
    type: 'combat',
    region: 'europe',
    deploymentSize: 21212,
    deploymentPeriod: {
      start: '1950-10-18',
      end: '1953-07-27'
    },
    casualties: {
      killed: 721,
      wounded: 2111,
      missing: 168
    },
    languages: ['tr'],
    background: '터키는 미국에 이어 두 번째로 많은 병력을 파견한 국가로, 쿠눅리 전투에서 중공군의 공세를 막아내는 큰 전과를 올렸습니다. 터키군의 용맹함은 "포로가 된 터키군은 없다"는 말로 상징됩니다.',
    mainActivities: [
      '쿠눅리 전투 승리',
      '네바다 전초기지 방어',
      '서울 방어전 참전'
    ],
    koreanRelations: '한국과 터키는 "피로 맺어진 형제국"이라는 특별한 유대감을 공유하고 있습니다. 양국은 경제, 문화 교류를 지속적으로 확대해왔으며, 한국에서는 터키에 대한 호감도가 매우 높습니다.'
  },
  {
    id: 'australia',
    name: '호주',
    nameEn: 'Australia',
    flag: '/images/flags/australia.png',
    type: 'combat',
    region: 'oceania',
    deploymentSize: 8407,
    deploymentPeriod: {
      start: '1950-07-01',
      end: '1953-07-27'
    },
    casualties: {
      killed: 339,
      wounded: 1216,
      missing: 29
    },
    languages: ['en'],
    background: '호주는 한국전쟁 초기부터 참전하여 영연방 부대의 일원으로 활동했습니다. 가평전투, 마량산 전투 등에서 중요한 역할을 수행했습니다.',
    mainActivities: [
      '가평전투 참전',
      '마량산 전투 참전',
      '공군과 해군 지원',
      '의료 지원'
    ],
    koreanRelations: '전쟁 이후 한국과 호주는 교역, 교육, 관광 등 다양한 분야에서 협력 관계를 확대해왔습니다. 많은 한국 학생들이 호주에서 유학하고 있으며, 한국은 호주의 주요 교역국 중 하나입니다.'
  },
  {
    id: 'canada',
    name: '캐나다',
    nameEn: 'Canada',
    flag: '/images/flags/canada.png',
    type: 'combat',
    region: 'north-america',
    deploymentSize: 6146,
    deploymentPeriod: {
      start: '1950-07-05',
      end: '1953-07-27'
    },
    casualties: {
      killed: 516,
      wounded: 1235,
      missing: 32
    },
    languages: ['en', 'fr'],
    background: '캐나다는 한국전쟁 초기부터 참전하여 영연방 부대의 일원으로 활동했습니다. 특히 가평전투에서 중공군의 대공세를 막아내는 데 기여했습니다.',
    mainActivities: [
      '가평전투 참전',
      '371고지 전투 참전',
      '해군 지원 활동',
      '의료 지원'
    ],
    koreanRelations: '전쟁 이후 양국은 경제, 교육, 이민 등 다양한 분야에서 협력 관계를 구축했습니다. 현재 많은 한국인들이 캐나다에 이민하거나 유학하고 있습니다.'
  },
  {
    id: 'sweden',
    name: '스웨덴',
    nameEn: 'Sweden',
    flag: '/images/flags/sweden.png',
    type: 'medical',
    region: 'europe',
    deploymentSize: 1124,
    deploymentPeriod: {
      start: '1950-09-23',
      end: '1957-04-12'
    },
    casualties: {
      killed: 2,
      wounded: 4,
      missing: 0
    },
    languages: ['sv'],
    background: '스웨덴은 중립국이었지만 인도주의적 지원의 일환으로 야전병원을 설치하여 의료 지원을 제공했습니다. 스웨덴 적십자병원은 1950년부터 1957년까지 운영되었습니다.',
    mainActivities: [
      '부산에 야전병원 설치 및 운영',
      '민간인 환자 치료',
      '한국 의료진 교육',
      '전쟁 고아 지원'
    ],
    koreanRelations: '스웨덴은 1957년 한국과 정식 수교를 맺은 첫 번째 북유럽 국가입니다. 현재는 무역, 투자, 문화 교류 등 다양한 분야에서 협력하고 있습니다.'
  }
]

export async function getNations(): Promise<Nation[]> {
  try {
    // Try to get nations from Firestore
    if (firestore) {
      const nationsCollection = collection(firestore, 'un_nations')
      const nationsSnapshot = await getDocs(nationsCollection)
      
      if (!nationsSnapshot.empty) {
        return nationsSnapshot.docs.map(doc => {
          const data = doc.data() as Omit<Nation, 'id'>
          return {
            id: doc.id,
            ...data
          }
        })
      }
    }
    
    // Try to get nations from Realtime Database as fallback
    if (database) {
      const nationsRef = ref(database, 'un_nations')
      const snapshot = await get(nationsRef)
      
      if (snapshot.exists()) {
        const data = snapshot.val()
        return Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }))
      }
    }
    
    // Return fallback data if no data from Firebase
    return fallbackNationsData
  } catch (error) {
    console.error('Error fetching nations:', error)
    return fallbackNationsData
  }
}

export async function getNationById(id: string): Promise<Nation | null> {
  try {
    // Try to get nations from Firestore
    if (firestore) {
      const nations = await getNations()
      const nation = nations.find(n => n.id === id)
      if (nation) return nation
    }
    
    // Return from fallback data if not found in Firebase
    const fallbackNation = fallbackNationsData.find(n => n.id === id)
    return fallbackNation || null
  } catch (error) {
    console.error('Error fetching nation by ID:', error)
    
    // Return from fallback data if error occurs
    const fallbackNation = fallbackNationsData.find(n => n.id === id)
    return fallbackNation || null
  }
}