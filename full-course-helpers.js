// Shared factory for the full syllabus courses. All explanations and questions are original.
const fullLesson=s=>lessons.push({
 id:s.id,subject:s.subject,title:s.title,topic:`${String(s.n).padStart(2,'0')} · ${s.unit}`,
 minutes:s.minutes||40,levels:s.levels||['Core','Extended','Practical'],intro:s.intro,
 objectives:s.sections.map(x=>x[0]),sections:s.sections.map(x=>section(x[0],x[1],x[2])),
 formulas:s.formulas,examples:s.examples.map(x=>example(x[0],x[1],x[2],x[3],x[4])),questions:s.questions
});
