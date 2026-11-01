import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('apps/docs/public/products', { recursive: true });
const illustrations = {
  headphones: {
    bg: '#efedf8',
    body: `<path d="M105 151v-27a75 75 0 0 1 150 0v27" fill="none" stroke="#29273a" stroke-width="16"/><path d="M106 138v-17a74 74 0 0 1 148 0v17" fill="none" stroke="#ada4d8" stroke-width="10"/><g transform="rotate(8 105 170)"><rect x="82" y="127" width="48" height="92" rx="23" fill="url(#body)"/><rect x="77" y="143" width="21" height="63" rx="10" fill="#343145"/><path d="M109 142v62" stroke="#a89bd8" stroke-width="3"/></g><g transform="rotate(-8 255 170)"><rect x="230" y="127" width="48" height="92" rx="23" fill="url(#body)"/><rect x="262" y="143" width="21" height="63" rx="10" fill="#343145"/><path d="M251 145v58" stroke="#b8aee2" stroke-width="3"/></g><path d="M263 212l-5 20" stroke="#5f557e" stroke-width="3"/>`,
    colors: ['#9f91cf', '#6d5c9c'],
  },
  watch: {
    bg: '#eaf1ed',
    body: `<path d="M147 77V34h66v43 M147 217v49h66v-49" stroke="#82988c" stroke-width="4" fill="#9aae9f"/><path d="M158 38h43 M158 49h43 M158 253h43" stroke="#85988c" stroke-width="2"/><rect x="127" y="72" width="106" height="151" rx="29" fill="#aab4b0"/><rect x="132" y="77" width="96" height="141" rx="24" fill="#1e2826"/><rect x="236" y="111" width="7" height="22" rx="3" fill="#718078"/><circle cx="180" cy="147" r="35" fill="none" stroke="#83b89d" stroke-width="5" stroke-dasharray="180 50" transform="rotate(-90 180 147)"/><circle cx="180" cy="147" r="26" fill="none" stroke="#e2bd82" stroke-width="4" stroke-dasharray="115 50" transform="rotate(-90 180 147)"/><path d="M180 129v18l13 8" stroke="#e3eae5" stroke-width="3" stroke-linecap="round"/><circle cx="180" cy="147" r="3" fill="#fff"/><path d="M164 194h32" stroke="#607a6a" stroke-width="4" stroke-linecap="round"/>`,
    colors: ['#93ad9e', '#536d60'],
  },
  speaker: {
    bg: '#f5eee4',
    body: `<rect x="95" y="87" width="170" height="142" rx="30" fill="url(#body)"/><path d="M128 87V71c0-35 104-35 104 0v16" stroke="#a99072" stroke-width="9" fill="none"/><rect x="105" y="106" width="150" height="104" rx="20" fill="url(#mesh)"/><circle cx="180" cy="157" r="35" fill="#8f7e68" opacity=".2"/><rect x="155" y="94" width="50" height="5" rx="2.5" fill="#a38d72"/><path d="M170 157h20 M180 147v20" stroke="#73634f" stroke-width="3" stroke-linecap="round"/>`,
    colors: ['#dbc8a9', '#bfa686'],
  },
  camera: {
    bg: '#f1eee9',
    body: `<rect x="83" y="100" width="194" height="130" rx="24" fill="url(#body)"/><path d="M111 100l14-27h62l17 27" fill="#d9cbb7"/><rect x="92" y="113" width="174" height="101" rx="15" fill="#eee6d9"/><circle cx="183" cy="163" r="48" fill="#c8b9a3"/><circle cx="183" cy="163" r="38" fill="#31363a"/><circle cx="183" cy="163" r="28" fill="#4e5c61"/><circle cx="183" cy="163" r="20" fill="#263a42"/><circle cx="175" cy="155" r="8" fill="#8faab3" opacity=".5"/><rect x="104" y="124" width="28" height="17" rx="4" fill="#b4b9ae"/><rect x="244" y="125" width="12" height="12" rx="3" fill="#edb181"/><rect x="119" y="87" width="19" height="9" rx="4" fill="#55594e"/>`,
    colors: ['#ddd0bd', '#baab95'],
  },
  keyboard: {
    bg: '#eceef4',
    body: `<g transform="translate(0 25) rotate(-8 180 150)"><rect x="45" y="91" width="270" height="120" rx="14" fill="#616775"/><rect x="49" y="87" width="262" height="114" rx="11" fill="#c6cad4"/>${Array.from(
      { length: 5 },
      (_, r) =>
        Array.from({ length: r === 4 ? 5 : 12 }, (_, c) => {
          const x = 58 + c * (r === 4 ? 48 : 20),
            y = 98 + r * 19;
          return `<rect x="${x}" y="${y}" width="${r === 4 ? 42 : 16}" height="14" rx="3" fill="${r === 0 && c === 0 ? '#9a8ed0' : c > 9 ? '#999fae' : '#f1f0ed'}"/><path d="M${x + 4} ${y + 5}h4" stroke="#bcc0ca" stroke-width="1"/>`;
        }).join(''),
    ).join('')}</g>`,
    colors: ['#c9cdd9', '#9098ac'],
  },
  bag: {
    bg: '#f5ece7',
    body: `<path d="M154 78V62c0-28 53-28 53 0v16" fill="none" stroke="#8d6152" stroke-width="9"/><path d="M125 96c-18 20-26 67-21 104 M238 96c18 20 26 67 21 104" stroke="#9a6a57" stroke-width="13" fill="none"/><path d="M121 102c0-30 118-30 118 0l13 125c0 28-144 28-144 0l13-125z" fill="url(#body)"/><path d="M131 106c0-13 98-13 98 0" stroke="#dfaa8e" stroke-width="2" fill="none"/><rect x="130" y="157" width="101" height="67" rx="14" fill="#ac755f"/><path d="M141 171h78" stroke="#e9ba9e" stroke-width="2"/><rect x="167" y="117" width="27" height="17" rx="3" fill="#dfbc9c"/><path d="M175 123h11 M175 127h8" stroke="#9a6b55" stroke-width="1.5"/>`,
    colors: ['#cc967b', '#ae755e'],
  },
};
for (const [name, { bg, body, colors }] of Object.entries(illustrations))
  writeFileSync(
    `apps/docs/public/products/${name}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 300"><defs><linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient><pattern id="mesh" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#c7b295"/><circle cx="2" cy="2" r=".7" fill="#8d7b62"/></pattern><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter></defs><rect width="360" height="300" fill="${bg}"/><ellipse cx="182" cy="250" rx="92" ry="11" fill="#26344a" opacity=".10" filter="url(#shadow)"/>${body}</svg>`,
  );
