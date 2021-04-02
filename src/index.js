import { using, spec, h, variant, val } from 'forest';
import { styled, StyledRoot } from 'foliage';

import {
  $list,
  $show,
  toggle,
  $hitBottom,
  $hitTop,
  prev,
  next,
  deleteRandomRange,
} from './model';
import { virtualList } from './virtual-list';

const Wrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
`;

const List = styled.ul`
  max-width: 80%;
  min-width: 200px;
  max-height: 400px;
  overflow: hidden scroll;
  border: 1px solid red;
  padding: 0;
  margin: 0;
  resize: vertical;
`;

const Item = styled.li`
  display: flex;
  flex-flow: column;
  background-color: var(--bgColor);
  padding: 8px;
  height: 100px;
  width: 100%;
  box-sizing: border-box;
`;

const Line = styled.div``;

const App = () => {
  Wrapper(() => {
    h('h1', () => {
      spec({
        text: 'Virtual list with `forest`',
      });
    });
    h('h2', () => {
      spec({
        text: val`Item's count: ${$list.map((l) => l.length)}`,
      });
    });

    h('button', () => {
      spec({
        handler: {
          click: toggle,
        },
        text: $show.map((s) => (s ? 'Hide list' : 'Show list')),
      });
    });

    h('button', () => {
      spec({
        handler: {
          click: prev,
        },
        text: 'Add items to top',
      });
    });
    h('button', () => {
      spec({
        handler: {
          click: next,
        },
        text: 'Add items to bottom',
      });
    });
    h('button', () => {
      spec({
        handler: {
          click: deleteRandomRange,
        },
        text: 'Delete random items',
      });
    });
    variant({
      source: $show,
      cases: {
        true: () =>
          List(() => {
            virtualList({
              options: {
                overscan: 2,
                estimateSize: () => 100,
                onTopHit: $hitTop,
                onBottomHit: $hitBottom,
              },
              source: $list,
              key: 'account',
              fields: ['color', 'type', 'name', 'amount'],
              fn: ({ fields: [color, type, name, amount] }) =>
                Item(() => {
                  spec({
                    styleVar: {
                      bgColor: color,
                    },
                  });

                  Line({ text: type });
                  Line({ text: name });
                  Line({ text: amount });
                }),
            });
          }),
      },
    });
  });
};

using(document.querySelector('#app'), App);
using(document.querySelector('head'), StyledRoot);
