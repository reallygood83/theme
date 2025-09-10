'use client';

import { useState } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

interface Worksheet {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'single' | 'double'; // single page or double page (front/back)
}

const worksheets: Worksheet[] = [
  {
    id: 'debate-topic-checklist',
    title: '좋은 토론 논제 찾기 체크리스트',
    description: '효과적인 토론 주제를 선정하기 위한 가이드라인과 체크리스트',
    content: `
    <div style="font-family: 'Nanum Gothic', sans-serif; line-height: 1.5; color: #333; max-width: 780px; margin: 15px auto; padding: 20px; background-color: #f9f9f9; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); border-radius: 8px; font-size: 0.95em;">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700&display=swap');
            .worksheet h1 { color: #2c3e50; text-align: center; font-size: 1.8em; margin-bottom: 20px; border-bottom: 3px solid #ffcc00; padding-bottom: 8px; }
            .worksheet p { margin-bottom: 10px; }
            .worksheet .section-intro { background-color: #e8f5e9; padding: 12px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #d4edda; }
            .worksheet .topic-input-group { display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 20px; gap: 10px; }
            .worksheet .topic-input-item { flex: 1; min-width: 200px; }
            .worksheet .topic-input-item label { font-size: 1.05em; font-weight: bold; color: #4a69bd; display: block; margin-bottom: 5px; }
            .worksheet .topic-input-item input[type="text"] { width: 100%; padding: 8px; border: 1px solid #a8c8f0; border-radius: 4px; font-size: 1em; box-sizing: border-box; }
            .worksheet table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .worksheet th, .worksheet td { padding: 8px 5px; text-align: left; border: 1px solid #ddd; }
            .worksheet th { background-color: #4a69bd; color: white; font-weight: bold; font-size: 1em; vertical-align: middle; text-align: center; }
            .worksheet .question-description { font-size: 0.85em; color: #555; margin-top: 3px; line-height: 1.3; }
            .worksheet .checkbox-container { display: flex; justify-content: center; align-items: center; height: 100%; }
            .worksheet .checkbox-container input[type="checkbox"] { transform: scale(1.3); }
            .worksheet .final-selection-area { margin-top: 30px; padding: 25px; border: 2px solid #ffcc00; border-radius: 10px; background-color: #fffbe6; text-align: center; }
            .worksheet .final-selection-area h2 { color: #e67e22; font-size: 1.6em; margin-bottom: 15px; }
            .worksheet .final-selection-area label { font-weight: bold; color: #2c3e50; display: block; margin-bottom: 8px; font-size: 1em; }
            .worksheet .final-selection-area input[type="text"] { width: 80%; padding: 10px; border: 2px solid #f39c12; border-radius: 5px; font-size: 1.1em; box-sizing: border-box; margin-bottom: 15px; }
            .worksheet .final-selection-area textarea { width: 100%; min-height: 100px; padding: 10px; border: 2px solid #f39c12; border-radius: 5px; font-size: 0.95em; resize: vertical; box-sizing: border-box; }
            .worksheet .note { text-align: center; font-size: 0.85em; color: #777; margin-top: 30px; }
        </style>
        
        <div class="worksheet">
            <h1>💡 좋은 토론 논제 찾기 체크리스트 활동지</h1>

            <div class="section-intro">
                <p><strong>토론을 시작하기 전에, 우리가 정한 3가지 논제가 토론하기에 좋은 논제인지 함께 확인해봐요!</strong></p>
                <p>아래 질문들을 읽고, 각 논제가 <strong>'예'</strong>에 가까울수록 좋은 논제예요. 질문 옆의 <strong>[예]</strong> 또는 <strong>[아니오]</strong> 칸에 체크해주세요. 모든 논제를 평가한 후, 가장 좋은 논제 한 가지를 선택해봅시다!</p>
            </div>

            <div class="topic-input-group">
                <div class="topic-input-item">
                    <label for="topic1">논제 1:</label>
                    <input type="text" id="topic1" name="topic1" placeholder="">
                </div>
                <div class="topic-input-item">
                    <label for="topic2">논제 2:</label>
                    <input type="text" id="topic2" name="topic2" placeholder="">
                </div>
                <div class="topic-input-item">
                    <label for="topic3">논제 3:</label>
                    <input type="text" id="topic3" name="topic3" placeholder="">
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th rowspan="2">질문</th>
                        <th colspan="2">논제 1</th>
                        <th colspan="2">논제 2</th>
                        <th colspan="2">논제 3</th>
                    </tr>
                    <tr>
                        <th>예</th>
                        <th>아니오</th>
                        <th>예</th>
                        <th>아니오</th>
                        <th>예</th>
                        <th>아니오</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <p><strong>1. 이 논제에 대해 서로 다른 의견이 있나요?</strong></p>
                            <p class="question-description">🗣️ 찬성하는 친구들도 있고, 반대하는 친구들도 있어서 이야깃거리가 많아야 해요. 누구나 '맞아!' 하고 생각하는 내용은 토론하기 어렵겠죠?</p>
                        </td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q1_topic1"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q1_topic1"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q1_topic2"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q1_topic2"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q1_topic3"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q1_topic3"></div></td>
                    </tr>
                    <tr>
                        <td>
                            <p><strong>2. 이 논제는 한 문장으로 분명하게 말할 수 있나요?</strong></p>
                            <p class="question-description">📝 논제는 짧고 쉽게 알아들을 수 있어야 해요. '이게 무슨 말이지?' 하고 헷갈리면 안 돼요.</p>
                        </td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q2_topic1"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q2_topic1"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q2_topic2"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q2_topic2"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q2_topic3"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q2_topic3"></div></td>
                    </tr>
                    <tr>
                        <td>
                            <p><strong>3. 이 논제는 우리 6학년 친구들이 충분히 이해할 수 있나요?</strong></p>
                            <p class="question-description">🧠 너무 어렵거나 전문적인 내용은 초등학생들이 토론하기 힘들어요. 우리가 학교생활에서 겪거나 생각해볼 수 있는 주제가 좋아요.</p>
                        </td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q3_topic1"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q3_topic1"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q3_topic2"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q3_topic2"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q3_topic3"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q3_topic3"></div></td>
                    </tr>
                    <tr>
                        <td>
                            <p><strong>4. 이 논제는 우리가 배운 내용과 관련이 있나요?</strong></p>
                            <p class="question-description">📚 교과서에서 배우거나 뉴스에서 본 내용처럼 우리가 아는 것과 연결되면 더 풍부한 토론을 할 수 있어요.</p>
                        </td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q4_topic1"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q4_topic1"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q4_topic2"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q4_topic2"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q4_topic3"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q4_topic3"></div></td>
                    </tr>
                    <tr>
                        <td>
                            <p><strong>5. 이 논제는 어느 한쪽으로 치우치지 않고 공평한가요?</strong></p>
                            <p class="question-description">⚖️ 어떤 사람들에게는 불쾌하거나, 특정 생각을 강요하는 것처럼 느껴지면 안 돼요. 모든 친구들이 편안하게 참여할 수 있어야 해요.</p>
                        </td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q5_topic1"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q5_topic1"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q5_topic2"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q5_topic2"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q5_topic3"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q5_topic3"></div></td>
                    </tr>
                    <tr>
                        <td>
                            <p><strong>6. 이 논제는 우리가 직접 조사하거나 생각해볼 거리가 충분한가요?</strong></p>
                            <p class="question-description">🔍 간단하게 '네/아니오'로 답하고 끝나는 것이 아니라, 왜 그렇게 생각하는지 이유를 찾고 근거를 들어 말할 수 있어야 해요.</p>
                        </td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q6_topic1"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q6_topic1"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q6_topic2"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q6_topic2"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q6_topic3"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q6_topic3"></div></td>
                    </tr>
                    <tr>
                        <td>
                            <p><strong>7. 이 논제로 토론하면 재미있고 신날 것 같나요?</strong></p>
                            <p class="question-description">😄 친구들과 함께 이야기하면서 새로운 것을 배우고, 즐겁게 참여할 수 있는 주제가 가장 좋아요!</p>
                        </td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q7_topic1"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q7_topic1"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q7_topic2"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q7_topic2"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q7_topic3"></div></td>
                        <td><div class="checkbox-container"><input type="checkbox" name="q7_topic3"></div></td>
                    </tr>
                </tbody>
            </table>

            <div class="final-selection-area">
                <h2>🏆 우리가 선택한 최고의 논제는?</h2>
                <p>위에서 평가한 3가지 논제 중에서, 가장 좋은 논제 한 가지를 골라 적어주세요!</p>

                <label for="finalTopic">내가 선택한 논제:</label>
                <input type="text" id="finalTopic" name="finalTopic" placeholder="">

                <label for="whyChosen">이 논제를 선택한 이유를 자세히 설명해주세요. (체크리스트 질문들을 참고해서 이유를 써봐요!)</label>
                <textarea id="whyChosen" name="whyChosen" placeholder=""></textarea>
            </div>

            <p class="note">✨ 이 활동지가 여러분이 멋진 토론을 준비하는 데 도움이 되기를 바랍니다! ✨</p>
        </div>
    </div>
    `,
    type: 'single'
  },
  {
    id: 'debate-activity-front',
    title: '두근두근 토론 활동지 (앞면)',
    description: '토론 주제 분석부터 근거 자료 수집까지 체계적인 토론 준비 활동지',
    content: `
    <div style="font-family: 'Inter', sans-serif; background-color: #f0f4f8; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; padding: 20px;">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            .worksheet-container-front { background-color: #ffffff; border-radius: 16px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08); padding: 35px; max-width: 780px; width: 100%; box-sizing: border-box; }
            .worksheet-front h1 { color: #2d3748; font-size: 2.8rem; font-weight: 800; text-align: center; margin-bottom: 15px; letter-spacing: -0.05em; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); }
            .worksheet-front .subtitle { color: #4a5568; font-size: 1.25rem; font-weight: 600; text-align: center; margin-bottom: 35px; }
            .worksheet-front h2 { color: #3182ce; font-size: 2.1rem; font-weight: 800; margin-top: 40px; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #a7d9f8; display: flex; align-items: center; gap: 12px; }
            .worksheet-front h3 { color: #4a5568; font-size: 1.4rem; font-weight: 700; margin-top: 20px; margin-bottom: 8px; }
            .worksheet-front p { color: #4a5568; font-size: 1.15rem; line-height: 1.6; margin-bottom: 12px; }
            .worksheet-front .label-text { color: #718096; font-size: 1.0rem; margin-bottom: 6px; }
            .worksheet-front textarea { width: 100%; padding: 12px 16px; border: 2px solid #6b7280; border-radius: 10px; background-color: #ffffff; font-size: 1.15rem; line-height: 1.6; resize: vertical; min-height: 60px; box-sizing: border-box; transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }
            .worksheet-front textarea:focus { outline: none; border-color: #3182ce; box-shadow: 0 0 0 4px rgba(49, 130, 206, 0.4); }
            .worksheet-front .info-box { background-color: #ebf8ff; border: 1px solid #90cdf4; border-radius: 12px; padding: 22px; margin-top: 30px; font-size: 1.05rem; color: #2c5282; }
            .worksheet-front .tip-item { display: flex; align-items: flex-start; margin-bottom: 14px; gap: 10px; }
            .worksheet-front .tip-icon { color: #3182ce; font-size: 1.4rem; line-height: 1.6; }
            .worksheet-front .header-info { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 1.15rem; color: #4a5568; }
            .worksheet-front .header-info span { display: flex; align-items: center; gap: 8px; }
            .worksheet-front .header-info .name-date-line { border-bottom: 2px dashed #a0aec0; flex-grow: 1; padding-left: 10px; padding-right: 10px; }
            .worksheet-front .mb-4 { margin-bottom: 16px; }
        </style>
        
        <div class="worksheet-container-front">
            <div class="worksheet-front">
                <h1>🚀 두근두근 토론 활동지 🚀</h1>
                <p class="subtitle">토론의 달인, 바로 너!</p>

                <div class="header-info">
                    <span>🌟 이름: <span class="name-date-line"></span></span>
                    <span>🌟 날짜: <span class="name-date-line"></span></span>
                </div>

                <h2>💡 1단계: 토론 주제 확인!</h2>
                <p>오늘 우리가 함께 이야기할 흥미진진한 주제는 무엇일까요?</p>
                <textarea rows="2"></textarea>

                <h2>💖 2단계: 나의 강력한 주장 (생각)!</h2>
                <p>토론 주제에 대해 나는 어떻게 생각하는지, 나의 주장을 한두 문장으로 명확하게 적어보세요!</p>
                <textarea rows="3"></textarea>

                <h2>🔍 3단계: 근거 자료 찾기! (이유)</h2>
                <p>나의 주장을 튼튼하게 만들어 줄 근거 자료들을 찾아보고, 중요한 내용을 간단히 메모해 보세요!</p>

                <div class="mb-4">
                    <h3>근거 자료 1</h3>
                    <p class="label-text">자료 출처/내용 요약:</p>
                    <textarea rows="3"></textarea>
                </div>

                <div class="mb-4">
                    <h3>근거 자료 2</h3>
                    <p class="label-text">자료 출처/내용 요약:</p>
                    <textarea rows="3"></textarea>
                </div>

                <div class="mb-4">
                    <h3>근거 자료 3</h3>
                    <p class="label-text">자료 출처/내용 요약:</p>
                    <textarea rows="3"></textarea>
                </div>

                <h2>🔗 4단계: 내 주장과 근거 자료 연결하기 (메모)</h2>
                <p>내가 토론에서 주장을 펼치기 위해 이 근거 자료들을 어떻게 활용할지 간단히 메모해 보세요.<br>(예: "주장1은 자료 1을 통해 ~라고 설명할 수 있고, 자료 2는 ~한 점을 뒷받침합니다.")</p>
                <textarea rows="4"></textarea>
            </div>
        </div>
    </div>
    `,
    type: 'single'
  },
  {
    id: 'debate-activity-back',
    title: '두근두근 토론 활동지 (뒷면)',
    description: '토론 준비의 마지막 단계와 토론 후 성찰을 위한 활동지',
    content: `
    <div style="font-family: 'Inter', sans-serif; background-color: #f0f4f8; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; padding: 20px;">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            .worksheet-container-back { background-color: #ffffff; border-radius: 16px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08); padding: 35px; max-width: 780px; width: 100%; box-sizing: border-box; }
            .worksheet-back h1 { color: #2d3748; font-size: 2.8rem; font-weight: 800; text-align: center; margin-bottom: 15px; letter-spacing: -0.05em; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1); }
            .worksheet-back .subtitle { color: #4a5568; font-size: 1.25rem; font-weight: 600; text-align: center; margin-bottom: 35px; }
            .worksheet-back h2 { color: #3182ce; font-size: 2.1rem; font-weight: 800; margin-top: 40px; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #a7d9f8; display: flex; align-items: center; gap: 12px; }
            .worksheet-back h3 { color: #4a5568; font-size: 1.4rem; font-weight: 700; margin-top: 20px; margin-bottom: 8px; }
            .worksheet-back p { color: #4a5568; font-size: 1.15rem; line-height: 1.6; margin-bottom: 12px; }
            .worksheet-back .label-text { color: #718096; font-size: 1.0rem; margin-bottom: 6px; }
            .worksheet-back textarea { width: 100%; padding: 12px 16px; border: 2px solid #6b7280; border-radius: 10px; background-color: #ffffff; font-size: 1.15rem; line-height: 1.6; resize: vertical; min-height: 60px; box-sizing: border-box; transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }
            .worksheet-back textarea:focus { outline: none; border-color: #3182ce; box-shadow: 0 0 0 4px rgba(49, 130, 206, 0.4); }
            .worksheet-back .info-box { background-color: #ebf8ff; border: 1px solid #90cdf4; border-radius: 12px; padding: 22px; margin-top: 30px; font-size: 1.05rem; color: #2c5282; }
            .worksheet-back .tip-item { display: flex; align-items: flex-start; margin-bottom: 14px; gap: 10px; }
            .worksheet-back .tip-icon { color: #3182ce; font-size: 1.4rem; line-height: 1.6; }
            .worksheet-back .header-info { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 1.15rem; color: #4a5568; }
            .worksheet-back .header-info span { display: flex; align-items: center; gap: 8px; }
            .worksheet-back .header-info .name-date-line { border-bottom: 2px dashed #a0aec0; flex-grow: 1; padding-left: 10px; padding-right: 10px; }
        </style>
        
        <div class="worksheet-container-back">
            <div class="worksheet-back">
                <h1>🚀 두근두근 토론 활동지 🚀</h1>
                <p class="subtitle">토론의 달인, 바로 너!</p>

                <h2>🎯 5단계: 토론의 달인이 되기 위한 마지막 단계!</h2>
                <p>이제 나의 주장과 근거 자료를 잘 연결해서 친구들을 설득할 차례!<br>토론에서 **나의 주장을 논리적으로 표현**하기 위한 나만의 전략을 간단히 적어볼까요?</p>
                <p class="label-text">토론할 때 이길 수 있는 나만의 무기 (전략/준비물):</p>
                <textarea rows="3"></textarea>

                <h2>🏁 6단계: 토론을 마친 후 느낀 점 (선택 사항)</h2>
                <p>오늘 토론을 통해 새롭게 알게 된 점이나 느낀 점이 있다면 자유롭게 적어보세요!</p>
                <textarea rows="3"></textarea>

                <h2>🌟 7단계: 토론에 임하는 나의 멋진 다짐!</h2>
                <p>이번 토론을 통해 나는 어떤 점을 배우고 싶나요? 어떤 자세로 참여할지 다짐을 적어보세요!</p>
                <textarea rows="3"></textarea>

                <h2 class="mt-8">💎 토론의 팁!</h2>
                <div class="info-box">
                    <div class="tip-item">
                        <span class="tip-icon">💡</span>
                        <p>근거 자료는 믿을 수 있는 곳에서 찾아보세요. (예: 뉴스 기사, 연구 결과, 통계 자료 등)</p>
                    </div>
                    <div class="tip-item">
                        <span class="tip-icon">✨</span>
                        <p>내 주장을 논리적으로 뒷받침할 수 있는 자료를 신중하게 선택하세요.</p>
                    </div>
                    <div class="tip-item">
                        <span class="tip-icon">🗣️</span>
                        <p>상대방의 질문에도 자신 있게 대답할 수 있도록 미리 예상 질문을 생각해 보고 답변을 준비해 보세요.</p>
                    </div>
                    <div class="tip-item">
                        <span class="tip-icon">🤝</span>
                        <p><strong>상대방의 의견을 잘 듣고, 존중하는 태도로 토론에 참여하는 것이 중요해요!</strong></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    type: 'single'
  }
];

export default function MaterialsPage() {
  const [selectedWorksheet, setSelectedWorksheet] = useState<Worksheet | null>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'scenarios' | 'worksheets'>('sessions');

  const handlePrint = (worksheet: Worksheet) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${worksheet.title}</title>
          <style>
            body { 
              font-family: 'Noto Sans KR', Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${worksheet.content}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = (worksheet: Worksheet) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${worksheet.title}</title>
        <style>
          body { 
            font-family: 'Noto Sans KR', Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        ${worksheet.content}
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${worksheet.title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              📚 교육자료실
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              토론 교육을 위한 다양한 자료들을 한곳에서 만나보세요. 검증된 세션부터 창의적인 주제, 체계적인 활동지까지!
            </p>
          </div>

          {/* 개선된 탭 네비게이션 */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg p-2">
              <nav className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`flex-1 py-4 px-6 rounded-lg font-semibold text-sm transition-all duration-300 transform ${
                    activeTab === 'sessions'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:scale-102'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xl">🎯</span>
                    <span>토론 세션 공유</span>
                  </div>
                  <div className="text-xs mt-1 opacity-80">
                    {activeTab === 'sessions' ? '완성된 세션을 바로 활용하세요' : '즉시 사용 가능한 세션'}
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('scenarios')}
                  className={`flex-1 py-4 px-6 rounded-lg font-semibold text-sm transition-all duration-300 transform ${
                    activeTab === 'scenarios'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:scale-102'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xl">💡</span>
                    <span>토론 주제 공유</span>
                  </div>
                  <div className="text-xs mt-1 opacity-80">
                    {activeTab === 'scenarios' ? '창의적인 주제로 새로운 토론을' : '다양한 토론 주제'}
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('worksheets')}
                  className={`flex-1 py-4 px-6 rounded-lg font-semibold text-sm transition-all duration-300 transform ${
                    activeTab === 'worksheets'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:scale-102'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xl">📝</span>
                    <span>활동지</span>
                  </div>
                  <div className="text-xs mt-1 opacity-80">
                    {activeTab === 'worksheets' ? '체계적인 토론 준비 도구' : '인쇄용 활동지'}
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* 토론 세션 공유 탭 */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-blue-900 mb-1">공유된 토론 세션</h2>
                    <p className="text-blue-700 text-lg">검증된 학습 자료와 함께 완성된 토론 세션을 바로 활용하세요</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center space-x-3 bg-white/60 rounded-lg p-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-900">즉시 활용 가능</div>
                      <div className="text-sm text-blue-700">세션 코드로 바로 시작</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 bg-white/60 rounded-lg p-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-900">교사 추천</div>
                      <div className="text-sm text-blue-700">검증된 양질의 세션</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 bg-white/60 rounded-lg p-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-900">학습 자료 포함</div>
                      <div className="text-sm text-blue-700">완전한 교육 패키지</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">공유 세션 준비 중</h3>
                <p className="text-gray-600 mb-4">
                  다른 선생님들이 공유한 검증된 토론 세션을 곧 만나보실 수 있습니다.
                </p>
                <div className="text-sm text-blue-600 bg-blue-50 rounded-lg p-3">
                  💡 현재 시스템 개선 작업 중입니다. 조금만 기다려주세요!
                </div>
              </div>
            </div>
          )}

          {/* 토론 주제 공유 탭 */}
          {activeTab === 'scenarios' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-8 border border-green-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-green-900 mb-1">공유된 토론 주제</h2>
                    <p className="text-green-700 text-lg">창의적이고 흥미진진한 토론 주제로 학생들의 참여를 이끌어내세요</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center space-x-3 bg-white/60 rounded-lg p-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-green-900">창의적 주제</div>
                      <div className="text-sm text-green-700">새로운 관점의 토론</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 bg-white/60 rounded-lg p-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-green-900">참여도 UP</div>
                      <div className="text-sm text-green-700">학생 관심사 반영</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 bg-white/60 rounded-lg p-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-green-900">다양한 난이도</div>
                      <div className="text-sm text-green-700">수준별 맞춤 주제</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">공유 주제 준비 중</h3>
                <p className="text-gray-600 mb-4">
                  창의적이고 흥미진진한 토론 주제 모음을 곧 선보일 예정입니다.
                </p>
                <div className="text-sm text-green-600 bg-green-50 rounded-lg p-3">
                  🌟 다양한 수준과 주제의 토론 시나리오를 준비하고 있어요!
                </div>
              </div>
            </div>
          )}

          {/* 활동지 탭 */}
          {activeTab === 'worksheets' && (
            !selectedWorksheet ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-8 border border-purple-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl">📝</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-purple-900 mb-1">토론 활동지</h2>
                      <p className="text-purple-700 text-lg">체계적인 토론 준비를 위한 단계별 활동지를 제공합니다</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center space-x-3 bg-white/60 rounded-lg p-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-purple-900">체계적 구성</div>
                        <div className="text-sm text-purple-700">단계별 학습 가이드</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-white/60 rounded-lg p-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm3 2h6v4H7V4zm8 6v6h-2v-6h2zm-4 6v-6H7v6h4z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-purple-900">즉시 인쇄</div>
                        <div className="text-sm text-purple-700">바로 사용 가능</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-white/60 rounded-lg p-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zM3 7a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7zM4 2a1 1 0 000 2h12a1 1 0 100-2H4z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-purple-900">HTML 다운로드</div>
                        <div className="text-sm text-purple-700">디지털 활용 가능</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {worksheets.map((worksheet, index) => (
                    <Card key={worksheet.id} className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 shadow-lg overflow-hidden bg-white">
                      <div className="p-8">
                        <div className="mb-6 text-center">
                          <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                            index === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                            'bg-gradient-to-br from-purple-400 to-purple-600'
                          }`}>
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors duration-300">
                            {worksheet.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {worksheet.description}
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <Button
                            onClick={() => setSelectedWorksheet(worksheet)}
                            variant="primary"
                            size="sm"
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            미리보기
                          </Button>
                          
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handlePrint(worksheet)}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 font-medium"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                              인쇄
                            </Button>
                            <Button
                              onClick={() => handleDownload(worksheet)}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-2 border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50 hover:text-green-700 transition-all duration-200 font-medium"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              다운로드
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        {selectedWorksheet.title}
                      </h2>
                      <p className="text-purple-100">
                        {selectedWorksheet.description}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handlePrint(selectedWorksheet)}
                        variant="outline"
                        size="sm"
                        className="border-white text-white hover:bg-white hover:text-purple-600 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        인쇄
                      </Button>
                      <Button
                        onClick={() => handleDownload(selectedWorksheet)}
                        variant="outline"
                        size="sm"
                        className="border-white text-white hover:bg-white hover:text-purple-600 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        다운로드
                      </Button>
                      <Button
                        onClick={() => setSelectedWorksheet(null)}
                        variant="secondary"
                        size="sm"
                        className="bg-white text-purple-600 hover:bg-purple-50"
                      >
                        목록으로
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedWorksheet.content }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </RequireAuth>
  );
}