import { createStore, createEvent } from 'effector';
import faker from 'faker';

const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const getNext = (n = 10) => {
  const next = [];

  for (let i = 0; i < n; i += 1) {
    const fakeData = faker.helpers.createTransaction();

    next.push({ ...fakeData, color: getRandomColor() });
  }

  return next;
};

export const next = createEvent();
export const prev = createEvent();
export const $list = createStore(getNext(1000));

$list.watch((l) => console.log('list updated', l));

$list.on(next, (list, p) => list.concat(getNext(p)));
$list.on(prev, (list, p) => getNext(p).concat(list));

export const $show = createStore(true);
export const toggle = createEvent();

$show.on(toggle, (s) => !s);
