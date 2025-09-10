'use client';

import { useState } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import SharedSessionsList from '@/components/materials/SharedSessionsList';
import SharedScenariosList from '@/components/materials/SharedScenariosList';

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
  const [activeTab, setActiveTab] = useState<'worksheets' | 'sessions' | 'scenarios'>('worksheets');

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">교육자료실</h1>
            <p className="text-gray-600">토론 교육을 위한 활동지, 공유 세션, 토론 주제를 제공합니다.</p>
          </div>

          {/* 탭 네비게이션 */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('worksheets')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'worksheets'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📝 활동지
                </button>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'sessions'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🎯 토론 세션 공유
                </button>
                <button
                  onClick={() => setActiveTab('scenarios')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'scenarios'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  💡 토론 주제 공유
                </button>
              </nav>
            </div>
          </div>

          {/* 활동지 탭 */}
          {activeTab === 'worksheets' && (
            !selectedWorksheet ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {worksheets.map((worksheet) => (
                  <Card key={worksheet.id} className="hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {worksheet.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {worksheet.description}
                          </p>
                        </div>
                        <div className="ml-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setSelectedWorksheet(worksheet)}
                          variant="primary"
                          size="sm"
                          className="flex-1"
                        >
                          미리보기
                        </Button>
                        <Button
                          onClick={() => handlePrint(worksheet)}
                          variant="outline"
                          size="sm"
                          className="px-3"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        </Button>
                        <Button
                          onClick={() => handleDownload(worksheet)}
                          variant="outline"
                          size="sm"
                          className="px-3"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedWorksheet.title}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {selectedWorksheet.description}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handlePrint(selectedWorksheet)}
                        variant="outline"
                        size="sm"
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
                      >
                        목록으로
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedWorksheet.content }}
                  />
                </div>
              </div>
            )
          )}

          {/* 토론 세션 공유 탭 */}
          {activeTab === 'sessions' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">공유된 토론 세션</h2>
                <p className="text-gray-600">다른 선생님들이 공유한 토론 세션을 활용해보세요.</p>
              </div>
              
              <SharedSessionsList />
            </div>
          )}

          {/* 토론 주제 공유 탭 */}
          {activeTab === 'scenarios' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">공유된 토론 주제</h2>
                <p className="text-gray-600">다른 선생님들이 공유한 토론 주제를 활용해보세요.</p>
              </div>
              
              <SharedScenariosList />
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}