const form = document.querySelector('#shape-form');
const result = document.querySelector('#shape-result');
const title = document.querySelector('#result-title');
const explanation = document.querySelector('#result-explanation');
const links = document.querySelector('#result-links');

const labels = {
  oval: 'Oval',
  round: 'Round',
  square: 'Square',
  heart: 'Heart',
  diamond: 'Diamond',
  oblong: 'Oblong',
  triangle: 'Triangle',
};

// Use visible traits, reserving a comparison for answers that point in different directions.
function matchShape(length, width, jaw) {
  if (width === 'jaw') {
    return [['triangle'], 'A jaw wider than the forehead and cheeks is the main clue for a triangle outline.'];
  }
  if (width === 'forehead' && jaw === 'taper') {
    return [['heart'], 'A broad forehead and a jaw that visibly narrows toward the chin point toward a heart outline.'];
  }
  if (width === 'cheeks' && jaw === 'taper') {
    return [['diamond'], 'Cheekbones wider than both the forehead and jaw point toward a diamond outline.'];
  }
  if (length === 'long' && width === 'even') {
    return [['oblong'], 'A face that is clearly longer than wide, with similar widths across the forehead and jaw, points toward an oblong outline.'];
  }
  if (length === 'similar' && jaw === 'angle' && width === 'even') {
    return [['square'], 'Similar length and width, an even outline and a defined jaw angle point toward a square outline.'];
  }
  if (length === 'similar' && jaw === 'soft' && (width === 'cheeks' || width === 'even')) {
    return [['round'], 'Similar length and width with a softly curved jaw point toward a round outline.'];
  }
  if (length === 'longer' && jaw === 'soft' && (width === 'cheeks' || width === 'even')) {
    return [['oval'], 'A little more length than width and a soft jawline point toward an oval outline.'];
  }
  if (width === 'forehead') {
    return [['heart', 'oval'], 'Check how much the lower face narrows. A pronounced taper points toward heart, while a softer taper may look more oval.'];
  }
  if (width === 'cheeks') {
    const broadComparison = length === 'similar' ? 'round' : 'oval';
    return [[broadComparison, 'diamond'], 'Look again at how sharply the sides narrow above and below the cheekbones. More visible narrowing points toward diamond.'];
  }
  if (length === 'long') {
    return [['oblong', 'oval'], 'Compare how much longer the face looks and how straight the sides are. Straighter sides with more length point toward oblong.'];
  }
  if (length === 'similar') {
    return [['round', 'square'], 'Look at the corners of your jaw. A soft curve points toward round, while defined corners point toward square.'];
  }
  return [[], 'Look at the width and jawline again, then compare the illustrated outlines below. It is fine to use ideas from more than one shape.'];
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const answers = new FormData(form);
  const [shapes, detail] = matchShape(answers.get('length'), answers.get('width'), answers.get('jaw'));
  title.textContent = shapes.length === 1
    ? `Closest match: ${labels[shapes[0]]}`
    : shapes.length === 2
      ? `Compare ${shapes.map((shape) => labels[shape]).join(' and ')}`
      : 'Compare your outline';
  explanation.textContent = detail;
  links.replaceChildren();

  for (const shape of shapes.length ? shapes : ['face-shapes']) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${shape}`;
    a.textContent = shape === 'face-shapes' ? 'See the face shape guide' : `See ${labels[shape].toLowerCase()} haircut ideas`;
    li.append(a);
    links.append(li);
  }

  result.hidden = false;
  result.focus();
});

form.addEventListener('change', () => {
  result.hidden = true;
});

form.hidden = false;
