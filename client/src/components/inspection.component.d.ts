import React from 'react';
import './home.component.css';
import './inspection.stylesheet.scss';
export declare function ResizeBar(props: {
    hidden: boolean;
    setHidden: React.Dispatch<React.SetStateAction<boolean>>;
    width: number;
    setWidth: React.Dispatch<React.SetStateAction<number>>;
    maxWidth: number;
    barWidth: number;
    position: 'left' | 'right';
    minWidth: number;
}): JSX.Element;
export default function InspectionTab(): JSX.Element;
