/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the layout component, which is a worker app in the main
 * component. It generates data for the renderer component.
 */
/// <reference types="react" />
import { BasicEdge, BasicNode } from './router.component';
export type Shape = 'circle' | 'square' | 'triangle' | 'star' | 'line';
export interface ExtendedNode extends BasicNode {
    visualAttributes: {
        hue: number;
        saturation: number;
        lightness: number;
        shape: Shape;
        prevShape: Shape;
        radius: number;
        alpha: number;
        text: string;
        textScale: number;
        x: number;
        y: number;
    };
}
export interface ExtendedEdge extends BasicEdge {
    visualAttributes: {
        hue: number;
        saturation: number;
        lightness: number;
        text: string;
        width: number;
        alpha: number;
    };
}
/**
 * Returns a container, which is updated by reference to contain the graph.
 * @param param0 props
 * @returns JSX
 */
export default function PreProcess(): JSX.Element;
