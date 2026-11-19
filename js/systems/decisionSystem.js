const decisionTemplate = {
  id: "",

  type: "",

  description: "",

  options: []
};


function createDecision() {
  const decision = structuredClone(decisionTemplate);

  return decision;
}


export default createDecision;