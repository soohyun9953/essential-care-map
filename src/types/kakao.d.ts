// 카카오 지도 Web API TypeScript 타입 선언
export {};

declare global {
  interface Window {
    kakao?: {
      maps: typeof kakao.maps;
    };
  }

  namespace kakao {
    namespace maps {
      function load(callback: () => void): void;

      class LatLng {
        constructor(lat: number, lng: number);
        getLat(): number;
        getLng(): number;
      }

      class Map {
        constructor(container: HTMLElement, options: MapOptions);
        setCenter(latlng: LatLng): void;
        getCenter(): LatLng;
        setLevel(level: number, options?: { animate?: boolean | { duration?: number } }): void;
        getLevel(): number;
        panTo(latlng: LatLng): void;
        setMapTypeId(mapTypeId: MapTypeId): void;
        addControl(control: any, position: ControlPosition): void;
        removeControl(control: any, position?: ControlPosition): void;
        relayout(): void;
      }

      interface MapOptions {
        center: LatLng;
        level?: number;
        mapTypeId?: MapTypeId;
      }

      enum MapTypeId {
        ROADMAP = 1,
        SKYVIEW = 2,
        HYBRID = 3,
        OVERLAY = 4,
        TRAFFIC = 8,
        TERRAIN = 16,
        BICYCLE = 32,
        BICYCLE_HYBRID = 64,
        USE_DISTRICT = 1048576,
      }

      enum ControlPosition {
        TOP = 0,
        TOPRIGHT = 1,
        RIGHT = 2,
        BOTTOMRIGHT = 3,
        BOTTOM = 4,
        BOTTOMLEFT = 5,
        LEFT = 6,
        TOPLEFT = 7,
      }

      class ZoomControl {
        constructor();
      }

      class MapTypeControl {
        constructor();
      }

      class Marker {
        constructor(options: MarkerOptions);
        setMap(map: Map | null): void;
        getMap(): Map | null;
        setPosition(position: LatLng): void;
        getPosition(): LatLng;
        setTitle(title: string): void;
        setZIndex(zIndex: number): void;
      }

      interface MarkerOptions {
        map?: Map;
        position: LatLng;
        title?: string;
        image?: MarkerImage;
        zIndex?: number;
        clickable?: boolean;
      }

      class MarkerImage {
        constructor(src: string, size: Size, options?: MarkerImageOptions);
      }

      interface MarkerImageOptions {
        offset?: Point;
        alt?: string;
        coords?: string;
        shape?: string;
        spriteSize?: Size;
        spriteOrigin?: Point;
      }

      class Size {
        constructor(width: number, height: number);
      }

      class Point {
        constructor(x: number, y: number);
      }

      class Polygon {
        constructor(options: PolygonOptions);
        setMap(map: Map | null): void;
        getMap(): Map | null;
        setPath(path: LatLng[] | LatLng[][]): void;
        getPath(): LatLng[] | LatLng[][];
        setOptions(options: Partial<PolygonOptions>): void;
      }

      interface PolygonOptions {
        map?: Map;
        path: LatLng[] | LatLng[][];
        strokeWeight?: number;
        strokeColor?: string;
        strokeOpacity?: number;
        strokeStyle?: string;
        fillColor?: string;
        fillOpacity?: number;
        zIndex?: number;
      }

      class Polyline {
        constructor(options: PolylineOptions);
        setMap(map: Map | null): void;
        getMap(): Map | null;
        setPath(path: LatLng[]): void;
        getPath(): LatLng[];
        setOptions(options: Partial<PolylineOptions>): void;
        getLength(): number;
      }

      interface PolylineOptions {
        map?: Map;
        path: LatLng[];
        strokeWeight?: number;
        strokeColor?: string;
        strokeOpacity?: number;
        strokeStyle?: string;
        zIndex?: number;
      }

      class CustomOverlay {
        constructor(options: CustomOverlayOptions);
        setMap(map: Map | null): void;
        getMap(): Map | null;
        setPosition(position: LatLng): void;
        getPosition(): LatLng;
        setContent(content: HTMLElement | string): void;
        getContent(): HTMLElement | string;
        setVisible(visible: boolean): void;
        getVisible(): boolean;
        setZIndex(zIndex: number): void;
        getZIndex(): number;
      }

      interface CustomOverlayOptions {
        map?: Map;
        position: LatLng;
        content: HTMLElement | string;
        clickable?: boolean;
        xAnchor?: number;
        yAnchor?: number;
        zIndex?: number;
      }

      namespace event {
        function addListener(
          target: any,
          type: string,
          handler: (...args: any[]) => void
        ): void;
        function removeListener(
          target: any,
          type: string,
          handler: (...args: any[]) => void
        ): void;
      }
    }
  }
}
