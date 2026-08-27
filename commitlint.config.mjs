// release-please lee estos mismos tipos para armar el CHANGELOG. Un asunto que
// no encaje no da error en el release: simplemente desaparece de las notas, así
// que el filtro tiene que estar aquí, antes de que el commit exista.
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "perf", "refactor", "docs", "chore", "test", "build", "ci", "revert"],
    ],
    // Los asuntos van en español y en minúscula inicial; el default de
    // config-conventional prohíbe además Sentence case, que aquí sí queremos
    // permitir para nombres propios como Firestore o Vercel.
    "subject-case": [0],
    "header-max-length": [2, "always", 72],
  },
};

export default config;
