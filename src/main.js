import {age, name} from './message';
import {person1} from './person1';
import {person2} from './person2';
import {person3} from './person3';

const say = () => {
  console.log('name:', name);
  console.log('age:', age);
};

if (true) {
  var flag = true;
}

say();
console.log('flag:', flag);

console.log('person1:', person1);
console.log('person2:', person2);
console.log('person3:', person3);
