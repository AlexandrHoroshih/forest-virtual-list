import { createStore, createEvent } from 'effector';
import faker from 'faker';

const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const getNext = (n = 10) => {
  const next = [];

  for (let i = 0; i < n; i += 1) {
    const fakeData = faker.helpers.createTransaction();
    const randomSize = Math.ceil(100 + Math.random() * 100);

    next.push({ ...fakeData, color: getRandomColor(), size: randomSize });
  }

  return next;
};

export const next = createEvent();
export const prev = createEvent();
export const deleteRandomRange = createEvent();
export const $list = createStore(getNext(100));

$list.watch((l) => console.log('list updated', l));

$list.on(next, (list, p) => list.concat(getNext(10)));
$list.on(prev, (list, p) => getNext(10).concat(list));
$list.on(deleteRandomRange, (list) => {
  const start = Math.floor(Math.random() * 10);
  const size = Math.ceil(Math.random() * 25);

  const next = [...list].splice(start, size);

  return next;
});

export const $show = createStore(true);
export const toggle = createEvent();

$show.on(toggle, (s) => !s);

export const $hitBottom = createStore(false);
export const $hitTop = createStore(false);
