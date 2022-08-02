/// <reference types="react" />
import { VisGraph } from '../types';
import './home.component.css';
interface InspectTabProps {
    nodes: VisGraph.GraphNode[];
    edges: VisGraph.Edge[];
    directed: boolean;
}
export default function InspectTab(props: InspectTabProps): JSX.Element;
export {};
