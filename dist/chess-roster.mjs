// An editorial directory: one piece per member, with unassigned associates reserved.
// This order is also the reading order of the directory below the board.
export const departments=[
 {name:'Co-Presidents',members:['Co-Presidents'],type:'king',symbol:'♔',plural:'Kings',meaning:'Setting the direction.',squares:['d1','e8']},
 {name:'Corporate Relations',members:['Corporate Relations'],type:'queen',symbol:'♕',plural:'Queens',meaning:'Reaching across the board. Opening new connections.',squares:['d3','d6','e5']},
 {name:'Events',members:['Events'],type:'rook',symbol:'♖',plural:'Rooks',meaning:'Turning ambitious plans into memorable experiences.',squares:['a1','h1','a8','h8']},
 {name:'Finance & Operations',members:['Finance','Operations'],type:'bishop',symbol:'♗',plural:'Bishops',meaning:'Connecting resources, people and plans. Keeping the council moving.',squares:['c2','f2','c7','f7']},
 {name:'Marketing',members:['Marketing'],type:'knight',symbol:'♘',plural:'Knights',meaning:'Finding a different angle. Making the council seen.',squares:['b2','g2','b7','g7']},
 {name:'Associates',members:[],type:'pawn',symbol:'♙',plural:'Pawns',meaning:'Room for the council’s next perspectives.',squares:[]}
];
export const pieceNames={king:'King',queen:'Queen',rook:'Rook',bishop:'Bishop',knight:'Knight',pawn:'Pawn'};
export const associatePlaceholders=[...'abcdefgh'].map((file,index)=>({id:`associate-slot-${index+1}`,type:'pawn',square:`${file}4`,color:index%2?'black':'white',placeholder:true}));
export function councilPieces(members){
 return departments.flatMap(department=>members.filter(m=>department.members.includes(m.department)).map((member,index)=>{
  if(!department.squares[index])throw Error(`No council square assigned to ${member.id}`);
  return {...member,group:department.name,type:department.type,square:department.squares[index],color:index%2?'black':'white'};
 }));
}
