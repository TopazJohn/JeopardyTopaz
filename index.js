// pages/index.js
import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const categories = [
  { name: "Cold Calling", color: "#fc8b01", questions: [
      { points: 100, question: "What are two key pieces of info you must uncover in every cold call?", phone: "236-464-7068" },
      { points: 200, question: "Identify the decision maker in this company. Cold call: 310-953-4952", phone: "310-953-4952" },
      { points: 300, question: "Find out their current provider and biggest frustration. Call: 236-464-7068", phone: "236-464-7068" },
  ]},
  { name: "Topaz Product Knowledge", color: "#d9534f", questions: [
      { points: 100, question: "What is the shelf life of Topaz Drug Test kits?" },
      { points: 200, question: "What differentiates Topaz's lab confirmation process from others?" },
      { points: 300, question: "List two benefits of Topaz oral vs urine drug tests." },
  ]},
  { name: "Industry Lingo", color: "#5bc0de", questions: [
      { points: 100, question: "What does 'POCT' stand for?" },
      { points: 200, question: "Explain 'Chain of Custody' in drug testing." },
      { points: 300, question: "What is 'pre-employment' vs 'post-incident' testing?" },
  ]},
  { name: "Speed Round: Rebuttals", color: "#5cb85c", questions: [
      { points: 100, question: "Rebuttal: 'We’re happy with our current provider.'" },
      { points: 200, question: "Rebuttal: 'Too expensive.'" },
      { points: 300, question: "Rebuttal: 'I don’t have time to talk right now.'" },
  ]}
];

export default function Home() {
  const { width, height } = useWindowSize();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [timer, setTimer] = useState(30);
  const [intervalId, setIntervalId] = useState(null);
  const [dailyDouble, setDailyDouble] = useState(null);
  const [audio, setAudio] = useState(null);

  const [teamAName, setTeamAName] = useState("Team A");
  const [teamBName, setTeamBName] = useState("Team B");
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [isFinalJeopardy, setIsFinalJeopardy] = useState(false);
  const [finalQuestion, setFinalQuestion] = useState("Final Jeopardy: What is the most valuable sales principle?");
  const [finalWagerA, setFinalWagerA] = useState(0);
  const [finalWagerB, setFinalWagerB] = useState(0);

  useEffect(() => {
    setDailyDouble({ category: Math.floor(Math.random() * categories.length), index: Math.floor(Math.random() * 3) });
    setAudio(new Audio("/jeopardy-theme.mp3"));
  }, []);

  const handleQuestionClick = (q, categoryIdx, questionIdx) => {
    setCurrentQuestion(q);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2000);
    resetTimer();

    if (dailyDouble.category === categoryIdx && dailyDouble.index === questionIdx) {
      alert("🔥 Daily Double!");
    }
  };

  const resetTimer = () => {
    clearInterval(intervalId);
    setTimer(30);
  };

  const toggleTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      audio.pause();
    } else {
      const id = setInterval(() => {
        setTimer(prev => {
          if (prev === 1) {
            clearInterval(id);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setIntervalId(id);
      audio.play();
    }
  };

  const updateScore = (team, points) => {
    if (team === "A") setTeamAScore(teamAScore + points);
    if (team === "B") setTeamBScore(teamBScore + points);
  };

  const handleFinalJeopardy = () => setIsFinalJeopardy(true);

  const finalizeFinalJeopardy = (correctA, correctB) => {
    if (correctA) setTeamAScore(teamAScore + finalWagerA);
    else setTeamAScore(teamAScore - finalWagerA);
    if (correctB) setTeamBScore(teamBScore + finalWagerB);
    else setTeamBScore(teamBScore - finalWagerB);
    setIsFinalJeopardy(false);
  };

  const resetGame = () => {
    setCurrentQuestion(null);
    resetTimer();
    setTeamAScore(0);
    setTeamBScore(0);
    setConfetti(false);
    setIsFinalJeopardy(false);
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center">
      {confetti && <Confetti width={width} height={height} />}
      <img src="https://i.imgur.com/T5pyoab.png" alt="Logo" className="w-32 mb-4" />
      <h1 className="text-4xl font-bold mb-4 text-[#fc8b01]">Team Jeopardy!</h1>
      <div className="flex gap-4 mb-4">
        <div>
          <input value={teamAName} onChange={(e) => setTeamAName(e.target.value)} className="text-black mb-2 p-2 rounded" />
          <div className="text-2xl">{teamAName}: {teamAScore}</div>
        </div>
        <div>
          <input value={teamBName} onChange={(e) => setTeamBName(e.target.value)} className="text-black mb-2 p-2 rounded" />
          <div className="text-2xl">{teamBName}: {teamBScore}</div>
        </div>
      </div>

      {!isFinalJeopardy && (
        <>
          <div className="flex mb-4">
            {categories.map((cat, i) => (
              <div key={i} className="flex flex-col m-2">
                <div className="bg-gray-800 p-2 text-center font-bold">{cat.name}</div>
                {cat.questions.map((q, j) => (
                  <button
                    key={j}
                    onClick={() => handleQuestionClick(q, i, j)}
                    className={`p-4 m-1 border-2 ${dailyDouble.category === i && dailyDouble.index === j ? 'border-yellow-500' : 'border-[#fc8b01]'} bg-[#1a1a1a] hover:bg-[#333]`}
                  >
                    {q.points}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div onClick={toggleTimer} className={`text-3xl font-bold mb-4 cursor-pointer ${timer <= 5 ? 'text-red-500 animate-pulse' : ''}`}>Timer: {timer}s</div>
          <button onClick={handleFinalJeopardy} className="bg-yellow-500 text-black font-bold py-2 px-6 mb-4">Final Jeopardy</button>
        </>
      )}

      {isFinalJeopardy && (
        <div className="flex flex-col items-center">
          <h2 className="text-3xl mb-4">{finalQuestion}</h2>
          <div className="flex gap-4 mb-4">
            <input type="number" placeholder="{teamAName} Wager" value={finalWagerA} onChange={(e) => setFinalWagerA(Number(e.target.value))} className="text-black p-2 rounded" />
            <input type="number" placeholder="{teamBName} Wager" value={finalWagerB} onChange={(e) => setFinalWagerB(Number(e.target.value))} className="text-black p-2 rounded" />
          </div>
          <div className="flex gap-4">
            <button onClick={() => finalizeFinalJeopardy(true, true)} className="bg-green-500 p-4 rounded">Both Correct</button>
            <button onClick={() => finalizeFinalJeopardy(true, false)} className="bg-green-500 p-4 rounded">A Correct</button>
            <button onClick={() => finalizeFinalJeopardy(false, true)} className="bg-green-500 p-4 rounded">B Correct</button>
            <button onClick={() => finalizeFinalJeopardy(false, false)} className="bg-red-500 p-4 rounded">Both Wrong</button>
          </div>
        </div>
      )}
      <button onClick={resetGame} className="bg-[#fc8b01] rounded-xl px-6 py-3 mt-4">Reset Game</button>
    </div>
  );
}
