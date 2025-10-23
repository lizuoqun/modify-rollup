import {age, name} from './message';

const say = () => {
  console.log('name:', name);
  console.log('age:', age);
};

if (true) {
  var flag = true;
}

say();
console.log('flag:', flag);
