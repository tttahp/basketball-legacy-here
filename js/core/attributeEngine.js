const attributeTemplate = {
  speed: 0,
  strength: 0,
  stamina: 0,

  shoot: 0,
  threePoint: 0,
  pass: 0,
  rebound: 0,
  defense: 0,
  dunk: 0,
  handle: 0
};


function createAttributes() {
  const attributes = structuredClone(attributeTemplate);

  return attributes;
}


export default createAttributes;