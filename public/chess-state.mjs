export const openingMoves=[
 {from:'e2',to:'e4',san:'e4',title:'Claim the centre.',copy:'The pawn opens space for the queen and bishop while influencing the central squares.'},
 {from:'e7',to:'e5',san:'e5',title:'Meet the challenge.',copy:'Black takes an equal share of the centre. Every move changes the options available to both sides.'},
 {from:'g1',to:'f3',san:'Nf3',title:'Bring a piece into play.',copy:'The knight develops toward the centre and attacks the pawn on e5.'},
 {from:'b8',to:'c6',san:'Nc6',title:'Support the position.',copy:'Black develops a knight while defending the central pawn. One move can serve more than one purpose.'},
 {from:'f1',to:'c4',san:'Bc4',title:'Open a diagonal.',copy:'The bishop enters an active diagonal. The earlier pawn move made this route possible.'},
 {from:'f8',to:'c5',san:'Bc5',title:'Build with purpose.',copy:'Both sides have developed pieces and created possibilities. The position now comes from a sequence of connected decisions.'}
];
export function squarePosition(square){return{x:square.charCodeAt(0)-97-3.5,z:3.5-(Number(square[1])-1)};}
export function initialPieces(){
 const pieces=[],back=['rook','knight','bishop','queen','king','bishop','knight','rook'];
 for(const color of ['white','black'])for(let file=0;file<8;file++){
  const letter=String.fromCharCode(97+file),rank=color==='white'?1:8,pawnRank=color==='white'?2:7;
  pieces.push({id:`${color}-${letter}-back`,color,type:back[file],square:`${letter}${rank}`},{id:`${color}-${letter}-pawn`,color,type:'pawn',square:`${letter}${pawnRank}`});
 }
 return pieces;
}
export function positionAfter(step){
 const pieces=initialPieces();for(const move of openingMoves.slice(0,Math.max(0,Math.min(step,openingMoves.length)))){const piece=pieces.find(p=>p.square===move.from);if(!piece)throw Error('Invalid opening sequence');if(pieces.some(p=>p.square===move.to))throw Error('Occupied destination');piece.square=move.to;}
 return pieces;
}
