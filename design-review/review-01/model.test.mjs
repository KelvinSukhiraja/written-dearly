import test from 'node:test';
import assert from 'node:assert/strict';
import {fixtures,totals,arrive,undo} from './model.mjs';
test('counts distinguish seats, responses and arrivals',()=>assert.deepEqual(totals(fixtures()),{invited:6,extras:0,attending:3,pending:2,declined:1,arrived:1}));
test('duplicate and declined arrival attempts do not increment',()=>{const p=fixtures()[0];assert.deepEqual(arrive(p,['a','b','b','d']),['b']);assert.deepEqual(arrive(p,['a','b']),[]);assert.equal(totals([p]).arrived,2);});
test('undo only changes the latest selected arrivals',()=>{const p=fixtures()[0];const ids=arrive(p,['b','c']);undo(p,ids);assert.equal(p.seats[0].arrived,true);assert.equal(totals([p]).arrived,1);});
test('partial reply preserves pending seats',()=>{const p=fixtures()[1];p.seats[0].rsvp='attending';assert.equal(totals([p]).pending,1);assert.equal(totals([p]).declined,0);});
