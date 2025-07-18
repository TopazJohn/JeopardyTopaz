import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import path from 'path';
import fs from 'fs';

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'public', 'questions.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const questions = JSON.parse(jsonData);
  return { props: { questions } };
}

export default function JeopardyGame({ questions }) {
  // Teams state
  const [teamAName, setTeamAName] = useState('Team A');
  const [teamBName, setTeamBName] = useState('Team B');
  const [scores, setScores] = useState({ A: 0, B: 0 });

  // Game state
  const [board, setBoard] = useState(() =>
    questions.map(cat => ({
      category: cat.category,
      questions: cat.questions.map(q => ({ ...q, answered: false })),
    }))
  );

  const [currentQ, setCurrentQ] = useState(null); // { categoryIdx, qIdx }
  const [showQuestion, setShowQuestion] = useState(false);
  const [dailyDouble, setDailyDouble] = useState(false);
  const [finalJeopardy, setFinalJeopardy] = useState(false);
  const [wager, setWager] = useState(0);
  const [clutchTime, setClutchTime] = useState(false);

  // Timer state
  const [timer, setTimer] = useState(30);
  const timerId = useRef(null);
  const [timerRunning, setTimerRunning] = useState(false);

  // Sounds
  const beepSound = useRef(null);
  const correctSound = useRef(null);
  const wrongSound = useRef(null);

  // Timer effect
  useEffect(() => {
    if (timerRunning && timer > 0) {
      timerId.current = setTimeout(() => setTimer(t => t - 1), 1000);
      if (timer === 30) beepSound.current?.play();
    } else if (timer === 0 && timerRunning) {
      setTimerRunning(false);
      wrongSound.current?.play();
    }
    return () => clearTimeout(timerId.current);
  }, [timerRunning, timer]);

  // Handle question tile click
  function openQuestion(catIdx, qIdx) {
    if (board[catIdx].questions[qIdx].answered) return; // already answered
    setCurrentQ({ catIdx, qIdx });
    setShowQuestion(true);
    setTimer(30);
    setTimerRunning(false);
    setDailyDouble(false);
  }

  // Mark question answered and update score
  function answerQuestion(isCorrect, isDailyDouble = false) {
    if (!currentQ) return;
    const { catIdx, qIdx } = currentQ;
    const q = board[catIdx].questions[qIdx];
    const points = q.value * (isDailyDouble ? 2 : 1);

    // For demo: add to Team A if correct, else deduct from Team B — modify as needed
    if (isCorrect) {
      setScores(s => ({ ...s, A: s.A + points }));
      correctSound.current?.play();
    } else {
      setScores(s => ({ ...s, B: s.B - points }));
      wrongSound.current?.play();
    }

    // Mark answered
    setBoard(b => {
      const newBoard = [...b];
      newBoard[catIdx].questions[qIdx].answered = true;
      return newBoard;
    });

    setShowQuestion(false);
    setCurrentQ(null);
    setTimerRunning(false);
    setTimer(30);
  }

  // Toggle timer start/stop
  function toggleTimer() {
    setTimerRunning(r => !r);
    if (!timerRunning) beepSound.current?.play();
  }

  // Daily Double trigger (random for demo)
  function triggerDailyDouble() {
    setDailyDouble(true);
    setTimer(60);
    setTimerRunning(false);
  }

  // Final Jeopardy UI
  function startFinalJeopardy() {
    setFinalJeopardy(true);
  }

  function submitFinalWager() {
    // For demo: just end Final Jeopardy
    setFinalJeopardy(false);
    alert(`Final wager was ${wager}`);
  }

  return (
    <>
      <Head>
        <title>Topaz Jeopardy</title>
        <link rel="icon" href="/logo.png" />
      </Head>
      <audio ref={beepSound} src="/beep.wav" />
      <audio ref={correctSound} src="/correct.wav" />
      <audio ref={wrongSound} src="/wrong.wav" />

      <div style={{ maxWidth: 1200, margin: 'auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
        <header style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <img src="/logo.png" alt="Logo" style={{ height: 60, marginRight: 20 }} />
          <h1>Topaz Jeopardy</h1>
        </header>

        <section style={{ marginBottom: 20 }}>
          <label>
            Team A Name: &nbsp;
            <input value={teamAName} onChange={e => setTeamAName(e.target.value)} />
          </label>
          &nbsp;&nbsp;&nbsp;
          <label>
            Team B Name: &nbsp;
            <input value={teamBName} onChange={e => setTeamBName(e.target.value)} />
          </label>
          &nbsp;&nbsp;&nbsp;
          <button onClick={startFinalJeopardy}>Final Jeopardy</button>
        </section>

        <section style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div><strong>{teamAName}</strong><br />Score: {scores.A}</div>
          <div><strong>{teamBName}</strong><br />Score: {scores.B}</div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${board.length}, 1fr)`,
            gap: 8,
            textAlign: 'center',
          }}
        >
          {board.map((cat, catIdx) => (
            <div key={catIdx}>
              <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 18 }}>{cat.category}</div>
              {cat.questions.map((q, qIdx) => (
                <button
                  key={qIdx}
                  disabled={q.answered}
                  onClick={() => openQuestion(catIdx, qIdx)}
                  style={{
                    width: '100%',
                    padding: '16px 0',
                    marginBottom: 4,
                    fontSize: 16,
                    backgroundColor: q.answered ? '#999' : '#fc8b01',
                    color: 'white',
                    border: 'none',
                    cursor: q.answered ? 'default' : 'pointer',
                    borderRadius: 4,
                  }}
                >
                  ${q.value}
                </button>
              ))}
            </div>
          ))}
        </section>

        {showQuestion && currentQ && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              color: 'white',
              padding: 20,
              textAlign: 'center',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 12 }}>
              {board[currentQ.catIdx].questions[currentQ.qIdx].question}
            </div>

            <div style={{ fontSize: 40, marginBottom: 20, cursor: 'pointer' }} onClick={toggleTimer}>
              Timer: {timer}s {timerRunning ? '⏸️' : '▶️'}
            </div>

            <div>
              <button
                style={{ marginRight: 12, padding: '8px 16px', fontSize: 16 }}
                onClick={() => answerQuestion(true, dailyDouble)}
              >
                Correct
              </button>
              <button
                style={{ padding: '8px 16px', fontSize: 16 }}
                onClick={() => answerQuestion(false, dailyDouble)}
              >
                Wrong
              </button>
            </div>

            <button
              style={{
                marginTop: 20,
                backgroundColor: '#ccc',
                padding: '6px 12px',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
              onClick={() => setShowQuestion(false)}
            >
              Close
            </button>
          </div>
        )}

        {finalJeopardy && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: 'white',
              zIndex: 1100,
              padding: 30,
            }}
          >
            <h2>Final Jeopardy</h2>
            <p>Enter your wager (max score):</p>
            <input
              type="number"
              min="0"
              max={Math.max(scores.A, scores.B)}
              value={wager}
              onChange={e => setWager(Number(e.target.value))}
              style={{ fontSize: 24, textAlign: 'center', marginBottom: 20, width: 150 }}
            />
            <button
              onClick={submitFinalWager}
              style={{ fontSize: 20, padding: '10px 20px', cursor: 'pointer' }}
            >
              Submit Wager
            </button>
          </div>
        )}
      </div>
    </>
  );
}
