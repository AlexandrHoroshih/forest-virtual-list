import { using, spec, h, variant } from "forest";
import { styled, StyledRoot } from "foliage";

import { $list, $show, toggle } from "./model";
import { virtualList } from "./virtual-list";

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
    h("button", () => {
      spec({
        handler: {
          click: toggle
        },
        text: $show.map((s) => (s ? "Hide list" : "Show list"))
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
                estimateSize: () => 100
              },
              source: $list,
              key: "account",
              fields: ["color", "type", "name", "amount"],
              fn: ({ fields: [color, type, name, amount] }) =>
                Item(() => {
                  spec({
                    styleVar: {
                      bgColor: color
                    }
                  });

                  Line({ text: type });
                  Line({ text: name });
                  Line({ text: amount });
                })
            });
          })
      }
    });
  });
};

using(document.querySelector("#app"), App);
using(document.querySelector("head"), StyledRoot);
