import { useState, useEffect } from "react";

export const useHistory = (initial) => {
  const [{ index, states }, setHistory] = useState({
    index: 0,
    states: [...initial]
  });

  useEffect(() => {
    console.log("index:", index);
    console.log("states:", states);
  }, [index, states]);

  return [
    //undo
    () => {
      if (index <= 0) return states[index];

      setHistory({
        index: index - 1,
        states
      });

      //return states[index];
      return states.slice(0, index);
    },
    //redo
    () => {
      setHistory({
        index: index + 1,
        states
      });

      return states[index];
    },
    //push
    (newState) => {
      let updatedStates = [...states.slice(0, index + 1), newState];
      const newIndex = updatedStates.length - 1;

      setHistory({
        index: newIndex,
        states: updatedStates
      });

      return states[index];
    },
    //current state
    states[index]
  ];
};
