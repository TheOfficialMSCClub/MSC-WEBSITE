// An editorial directory: 17 introductions and 15 forthcoming council profiles, for a 32-piece board.
// This order is also the reading order of the directory below the board.
export const departments=[
 {name:'Co-Presidents',members:['Co-Presidents'],type:'king',symbol:'♔',plural:'Kings',meaning:"The piece every plan protects",squares:['d1','e8']},
 {name:'Corporate Relations',members:['Corporate Relations'],type:'queen',symbol:'♕',plural:'Queens',meaning:"Moves in any direction, like a good partnership lead",squares:['d3','d6','e5']},
 {name:'Events',members:['Events'],type:'rook',symbol:'♖',plural:'Rooks',meaning:"Holds the corners: rooms, dates, run sheets",squares:['a1','h1','a8','h8']},
 {name:'Finance & Operations',members:['Finance','Operations'],type:'bishop',symbol:'♗',plural:'Bishops',meaning:"Works the diagonals: budgets and schedules",squares:['c2','f2','c7','f7']},
 {name:'Marketing',members:['Marketing'],type:'knight',symbol:'♘',plural:'Knights',meaning:"The only piece that jumps. Marketing finds the angle nobody else took",squares:['b2','g2','b7','g7']},
 {name:'New introductions',members:[],type:'pawn',symbol:'♙',plural:'Pawns',meaning:"More of the council, coming into view. This member’s introduction will be revealed soon.",squares:[]}
];
export const pieceNames={king:'King',queen:'Queen',rook:'Rook',bishop:'Bishop',knight:'Knight',pawn:'Pawn'};
const pendingSquares=[...[...'abcdefgh'].map(file=>`${file}4`),...[...'abcdfgh'].map(file=>`${file}5`)];
export const associatePlaceholders=pendingSquares.map((square,index)=>({id:`associate-slot-${index+1}`,name:'Coming soon',role:'Council introduction coming soon',department:'New introductions',group:'New introductions',asset:'coming-soon',crop:[0,0,1,1],type:'pawn',square,color:index%2?'white':'black',placeholder:true,slot:index+1}));
export function councilPieces(members){
 return departments.flatMap(department=>members.filter(m=>department.members.includes(m.department)).map((member,index)=>{
  if(!department.squares[index])throw Error(`No council square assigned to ${member.id}`);
  return {...member,group:department.name,type:department.type,square:department.squares[index],color:index%2?'black':'white'};
 }));
}
