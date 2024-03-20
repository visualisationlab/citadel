import React, { useEffect, useState, useRef, useContext } from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { GraphDataContext } from "./main.component";
import { GraphDataReducerAction } from "../reducers/graphdata.reducer";

const scaling_factor = 50

const roleColors = {
  Kingpin: "#1E90FF",
  Dealer: "#87CEEB",
  Organizer: "#00BFFF",
  Financer: "#4682B4",
  Assassin: "#7B68EE",
};

function calculateSizeForValueOne() {
  const value = 1;
  const size = value * scaling_factor;
  return { value, size };
}

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
    // console.log("Graph State Nodes Data:", graphState.nodes.data);
    console.log("Updating graph appearance for action:", actionType);

    const updatedNodes = graphState.nodes.data
      .map((node) => {
        let newSize;
        let newColor;

        console.log(node);
        switch (actionType) {
          case "financial": {
            const financialCapital = node["Financial Capital"] || 1;
            if (financialCapital !== undefined) {
              newSize = financialCapital * scaling_factor;
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
            const criminalCapital = node["Criminal Capital"] || 1;
            if (criminalCapital !== undefined) {
              newSize = criminalCapital * scaling_factor;
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
            const violenceCapital = node["Violence Capital"] || 1;
            if (violenceCapital != undefined) {
              newSize = violenceCapital * scaling_factor;
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
          case "roleColor":
            if (node["Business Role"] !== undefined) {
                newColor = roleColors[node["Business Role"]] || "#000000";
            } else {
                console.warn("Business role not defined for node:", node.id);
            }
            break;
          default: {
            console.log("No action defined for this type.");
            return;
          }
        }

        return newSize || newColor
        ? {
            ...node,
            ...(newSize && { size: newSize }),
            ...(newColor && { color: newColor }),
        }
        : null;
})
.filter((node) => node !== null);

    if (updatedNodes.length > 0) {
      const action: GraphDataReducerAction = {
        type: "set",
        property: "data",
        value: {
          nodes: updatedNodes.map((update) => ({
            ...update
          })),
          edges: graphState.edges.data,
          globals: {},
        },
      };

      graphDispatch(action);
    }
  };


  const renderLegend = (activeButton) => {
    if (!activeButton) return <div>Select a button to see the legend.</div>;
  
    const actionType = ["Financial", "Criminal", "Violence", "roleColor"][activeButton - 1];
    
    if (actionType === "roleColor") {
      return Object.entries(roleColors).map(([role, color], index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: color, marginRight: '10px' }}></div>
          <span>{role}</span>
        </div>
      ));
    } else {
      const { value, size } = calculateSizeForValueOne();
      return (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', backgroundColor: '#000', marginRight: '10px' }}></div>
          <span>{actionType} Capital = {value}</span>
        </div>
      );
    }
  };
  

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
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
          style={{ marginLeft: "0px" }}
          className="mr-2 mb-2"
        >
          Revert State
        </Button>
      </div>
      <div style={{ marginTop: "20px" }}>{renderLegend(activeButton)}</div>
    </div>
  );
}

export default ButtonsComponent;
