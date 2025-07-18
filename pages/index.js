import fs from 'fs';
import path from 'path';

export async function getStaticProps() {
  // Build absolute path to questions.json
  const filePath = path.join(process.cwd(), 'public', 'questions.json');

  // Read the file contents
  const jsonData = fs.readFileSync(filePath, 'utf8');

  // Parse JSON
  const questions = JSON.parse(jsonData);

  return {
    props: { questions },
  };
}

export default function HomePage({ questions }) {
  if (!questions || questions.length === 0) {
    return <div>No questions found.</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Jeopardy Game Categories</h1>
      <ul>
        {questions.map((categoryObj, idx) => (
          <li key={idx}>
            <h2>{categoryObj?.category || 'No category'}</h2>
            <ul>
              {categoryObj?.questions?.map((q, qIdx) => (
                <li key={qIdx}>
                  ${q.value}: {q.question}
                </li>
              )) || <li>No questions</li>}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
