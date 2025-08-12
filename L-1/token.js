import { Tiktoken } from "js-tiktoken";
import o200k_base from "js-tiktoken/ranks/o200k_base";

const enc = new Tiktoken(o200k_base)
const userQu = "Hey there sup dude, I am debasish! how are u doin?";
const tokens = enc.encode(userQu);

console.log({tokens});

const encTokens = [
    25216, 1354, 1982, 66312,
       11,  357,  939,  4315,
      288, 1109,    0,  1495,
      553,  337,  621,   258,
       30
  ];

  const decoded = enc.decode(encTokens);

  console.log({decoded});
  
