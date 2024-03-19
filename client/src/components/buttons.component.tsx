import React, { useEffect, useState, useRef, useContext } from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { GraphDataContext } from "./main.component";
import { GraphDataReducerAction } from "../reducers/graphdata.reducer";

function ButtonsComponent() {
  const { graphState, graphDispatch } = useContext(GraphDataContext);
  const [activeButton, setActiveButton] = useState(null);
  const buttonGroupRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        buttonGroupRef.current &&
        !buttonGroupRef.current.contains(event.target)
      ) {
        setActiveButton(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const updateGraphAppearance = (actionType) => {
    if (!graphState || !graphState.nodes.data) {
      console.error("Graph state or nodes are not initialized.");
      return;
    }
  
    console.log("Updating graph appearance for action:", actionType);
  
    graphState.nodes.data.forEach((node) => {
      let newSize;
      let color;
  
      switch (actionType) {
        case "financial": {
          const financialCapital = node["Financial Capital"];
          if (financialCapital !== undefined) {
            newSize = financialCapital * 100;
            console.log(
              "The new size of the node is",
              newSize,
              "for node",
              node.id
            );
          } else {
            console.warn("Financial Capital not defined for node:", node.id);
          }
          break;
        }
        case "criminal": {
          const criminalCapital = node["Criminal Capital"];
          if (criminalCapital !== undefined) {
            newSize = criminalCapital * 100;
            console.log(
              "The new size of the node is",
              newSize,
              "for node",
              node.id
            );
          } else {
            console.warn("Criminal Capital not defined for node:", node.id);
          }
          break;
        }
        case "violence": {
          const violenceCapital = node["Violence Capital"];
          if (violenceCapital != undefined) {
            newSize = violenceCapital * 100;
            console.log(
              "The new size of the node is",
              newSize,
              "for node",
              node.id
            );
          } else {
            console.warn("Violence not defined for node:", node.id);
          }
          break;
        }
        case "roleColor": {
          const roleColors = {
            Kingpin: "#1E90FF",
            Dealer: "#87CEEB",
            Organizer: "#00BFFF",
            Financer: "#4682B4",
            Assassin: "#7B68EE",
          };
          color = roleColors[node["Business Role"]] || "#000000"
          break;
        }
        default: {
          console.log("No action defined for this type.");
          return;
        }
      }

      if (newSize || color) {
        const action: GraphDataReducerAction = {
          type: "update",
          object: "node",
          value: {
            id: node.id,
            attributes: {
              ...(newSize && { size: newSize }),
              ...(color && { color }),
            },
          },
        };

        graphDispatch(action);
      }
    });
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <ButtonGroup
        style={{ width: "100%", display: "flex" }}
        ref={buttonGroupRef}
        aria-label="Graph control buttons"
      >
        {["financial", "criminal", "violence", "roleColor"].map(
          (type, index) => (
            <Button
              key={type}
              variant={activeButton === index + 1 ? "primary" : "secondary"}
              onClick={() => {
                setActiveButton(index + 1);
                updateGraphAppearance(type);
              }}
              className="mr-2 mb-2"
            >
              {type === "roleColor"
                ? "Color nodes by role"
                : `Change node size: ${
                    type.charAt(0).toUpperCase() + type.slice(1)
                  }`}
            </Button>
          )
        )}
      </ButtonGroup>

      <Button
        variant="warning"
        onClick={() => {
          setActiveButton(null);
        }}
        style={{ marginLeft: "10px" }}
        className="mr-2 mb-2"
      >
        Revert State
      </Button>
    </div>
  );
}

export default ButtonsComponent;
