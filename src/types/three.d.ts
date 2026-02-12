/// <reference types="@react-three/fiber" />

import * as THREE from 'three'
import { ThreeElements } from '@react-three/fiber'

declare global {
    namespace JSX {
        interface IntrinsicElements extends ThreeElements { }
    }
}

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements extends ThreeElements { }
    }
}
