import { scaleOrdinal, rgb, packSiblings, packEnclose, select } from 'd3';

export const col2focus = {
  1: 'focus_lifestyle',
  2: 'focus_planning',
  3: 'focus_mobility',
  4: 'focus_infrastructure'
};

export const theme2row = {
  testbeds: 1,
  innovation: 2,
  financing: 3,
  management: 4,
  intelligence: 5
};

export const focusLabel = {
  1: 'Livsstil och  konsumtion',
  2: 'Planering och  byggd miljö',
  3: 'Mobilitet och  tillgänglighet',
  4: 'Integrerad  infrastruktur'
};

export const themeLabel = {
  1: 'Testbäddar och  living labs',
  2: 'Innovation och  entreprenörskap',
  3: 'Finansierings- och  affärsmodeller',
  4: 'Styrning',
  5: 'Intelligens,  cybersäkerhet  och etik'
};

export const projectTypes = ['Forskningsprojekt', 'Innovationsprojekt', 'Förstudie'];
export const projectTypeColors = scaleOrdinal()
  .range([rgb(0, 125, 145), rgb(151, 194, 142), rgb(234, 154, 0)]) // pms 3145, pms 2255, pms 2011
  .domain(projectTypes);

export function packData(data, scaleX, scaleY) {
  // first, group together circles that are
  // at the same position in the matrix
  const obj = {};
  for (let row = 1; row <= 5; ++row) {
    obj[row] = {};
    for (let col = 1; col <= 4; ++col) {
      obj[row][col] = [];
    }
  }
  data.data.forEach(project => {
    const pins = []; // so that a circle can find its buddies
    for (let col = 1; col <= 4; ++col) {
      project.survey_answers[col2focus[col]].forEach(theme => {
        pins.push({
          row: theme2row[theme],
          col
        });
        obj[theme2row[theme]][col].push({
          row: theme2row[theme],
          col,
          pins,
          id: project.survey_answers.project_id,
          title: project.survey_answers.project_title,
          type: project.survey_answers.project_type,
          organization: project.survey_answers.project_organization,
          budget: project.survey_answers.budget,
          r: Math.sqrt(project.survey_answers.budget.funded / Math.PI)
        })
      });
    }
  });

  // first pass: pack circles and find the "optimal scale"
  // and redo the circle radii to use that scale
  let maxEnclose = 0;
  for (let row = 1; row <= 5; ++row) {
    for (let col = 1; col <= 4; ++col) {
      if (!obj[row][col].length) continue; // if empty continue
      packSiblings(obj[row][col]);
      maxEnclose = Math.max(maxEnclose, packEnclose(obj[row][col]).r);
    }
  }
  const optimalEncloseRadius = Math.min(scaleX.step() / 2, scaleY.step() / 2); // * 0.95?
  const rScale = optimalEncloseRadius / maxEnclose;
  for (let row = 1; row <= 5; ++row) {
    for (let col = 1; col <= 4; ++col) {
      obj[row][col].forEach(pin => {
        pin.r = Math.sqrt(pin.budget.funded / Math.PI) * rScale;
      });
    }
  }

  // second pass: pack again, fix positions
  // and return as a flat list
  const arr = [];
  for (let row = 1; row <= 5; ++row) {
    for (let col = 1; col <= 4; ++col) {
      packSiblings(obj[row][col]).forEach(pin => {
        arr.push({
          ...pin,
          x: pin.x + scaleX(col),
          y: pin.y + scaleY(row),
          rScale
        })
      });
    }
  }
  return arr;
}

export function buildScaleData(packedData) {
  if (!packedData.length) return null;

  const rScale = packedData[0].rScale;
  let minBudget = Number.MAX_VALUE;
  let maxBudget = 0;
  packedData.forEach(d => {
    minBudget = Math.min(minBudget, d.budget.funded);
    maxBudget = Math.max(maxBudget, d.budget.funded);
  });

  return { rScale, minBudget, maxBudget };
}

// inspired by https://bl.ocks.org/mbostock/7555321
// replaces double spaces in the labels with fake "newlines"
// (tspan elements) and fixes their positions
export function parseNewlinesY(text) {
  text.each(function() {
    const text = select(this);
    const words = text.text().split(/ {2}/);
    const x = text.attr('x');
    const dy = parseFloat(text.attr('dy'));
    text.text(null);
    const lineHeight = 1.3; // em
    let i = 0;
    words.forEach(word => {
      text.append('tspan')
          .text(word)
          .attr('x', x)
          .attr('y', `-${(words.length - 1) * lineHeight / 2}em`)
          .attr('dy', `${dy + (i++ * lineHeight)}em`);
    });
  });
}
export function parseNewlinesX(text) {
  text.each(function() {
    const text = select(this).attr('text-anchor', 'start');
    const words = text.text().split(/ {2}/);
    const y = text.attr('y');
    const dy = parseFloat(text.attr('dy'));
    text.text(null);
    const lineHeight = 1.3; // em
    let i = 0;
    words.forEach(word => {
      text.append('tspan')
          .text(word)
          .attr('x', 0)
          .attr('dy', `${dy + (i++ * lineHeight)}em`);
    });
    text.attr('transform', `translate(0,${y})rotate(-45)translate(0,${-y})`);
  });
}