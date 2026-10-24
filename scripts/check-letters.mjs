import assert from 'node:assert/strict';
import {validateLetter,formatLetter,deliverLetter} from '../public/letter-model.mjs';
const member={name:'Test Student',year:'2nd',program:'Management',email:'student@example.com',interests:['Strategy Summit'],note:'Interested in cases.'};
const partner={name:'Test Partner',role:'Manager',organization:'Example Organization',email:'partner@example.com',kind:'Workshop',idea:'A decision-making workshop.'};
for(const [type,data,required] of [['member',member,['name','year','program','email']],['partner',partner,['name','role','organization','kind','idea','email']]]){
 assert.equal(validateLetter(type,data),null);
 for(const key of required)assert.equal(validateLetter(type,{...data,[key]:' '}).field,key);
 assert.equal(validateLetter(type,{...data,email:'bad-address'}).field,'email');
 const letter=formatLetter(type,data);assert(letter.includes(data.name));assert(letter.includes(data.email));
}
assert(formatLetter('member',{...member,interests:[],note:''}).includes('MSC membership'));
assert(formatLetter('partner',partner).includes('Corporate Relations'));
let requests=0;
assert.deepEqual(await deliverLetter('',member,{fetchImpl:()=>{requests++;}}),{mode:'copy'});assert.equal(requests,0,'No endpoint means no network request or false delivery.');
let request;
assert.deepEqual(await deliverLetter('https://example.com/letters',member,{fetchImpl:async(url,options)=>{request={url,...options};return {ok:true};}}),{mode:'sent',emailUpdates:'not_active'});
assert.equal(request.method,'POST');assert.equal(JSON.parse(request.body).email,member.email);assert.equal(request.credentials,'omit');
await assert.rejects(deliverLetter('https://example.com/letters',member,{fetchImpl:async()=>({ok:false})}),/could not be delivered/);
await assert.rejects(deliverLetter('http://example.com/letters',member),/not configured/);
await assert.rejects(deliverLetter('https://example.com/letters',member,{fetchImpl:async()=>{throw Error('Network unavailable');}}),/Network unavailable/);
console.log('PASS: member and partner validation, letter contents, no-endpoint fallback, successful delivery, HTTP and network failures.');
