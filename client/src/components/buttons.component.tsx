import React, { useEffect, useState, useRef } from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import {
  SigmaContainer,
  useLoadGraph,
  useSigma,
  useRegisterEvents,
  useSetSettings,
  ControlsContainer,
} from "@react-sigma/core";
import { Sigma } from "react-sigma";

interface ButtonsComponentProps {
  sigma: Sigma;
}

function ButtonsComponent({ sigma }: ButtonsComponentProps) {
  // const sigma = useSigma();
  console.log("Sigma:", sigma);
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
    console.log("Action type:", actionType);
    if (!sigma || !sigma.getGraph) {
      console.error(
        "Sigma instance is not available or does not have the getGraph method."
      );
      return;
    }
    if (!sigma) return;
    const graph = sigma.getGraph();
    graph.nodes().forEach((node) => {
      const nodeAttributes = graph.getNodeAttributes(node);
      console.log("Node attributes:", nodeAttributes);

      switch (actionType) {
        case "financial": {
          const newSize = nodeAttributes["Financial Capital"] * 20;
          graph.setNodeAttribute(node, "size", newSize);
          break;
        }
        case "criminal": {
          const newSize = nodeAttributes["Criminal Capital"] * 20;
          graph.setNodeAttribute(node, "size", newSize);
          break;
        }
        case "violence": {
          const newSize = nodeAttributes["Violence"] * 20;
          graph.setNodeAttribute(node, "size", newSize);
          break;
        }
        case "roleColor": {
          const roleColors = {
            Kingpin: "#1E90FF", // Dodger Blue
            Dealer: "#87CEEB", // Sky Blue
            Organizer: "#00BFFF", // Deep Sky Blue
            Financer: "#4682B4", // Steel Blue
            Assassin: "#7B68EE", // Medium Slate Blue
          };
          const color =
            roleColors[nodeAttributes["Business Role"]] || "#000000";
          graph.setNodeAttribute(node, "color", color);
          break;
        }
        default:
          console.log("No action defined for this type.");
      }
    });

    sigma.refresh();
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
                console.log(`Button ${index + 1} clicked`);
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
          console.log("Revert clicked");
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
