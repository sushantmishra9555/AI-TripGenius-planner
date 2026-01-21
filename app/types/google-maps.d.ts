export { };

declare global {
    namespace google {
        namespace maps {
            class Map {
                constructor(el: HTMLElement, opts: any);
                fitBounds(bounds: any): void;
            }
            class Marker {
                constructor(opts: any);
                addListener(event: string, cb: Function): void;
            }
            class LatLngBounds {
                extend(latlng: any): void;
            }
            class DirectionsService {
                route(request: any, callback: (result: any, status: any) => void): void;
            }
            class DirectionsRenderer {
                constructor(opts?: any);
                setMap(map: Map | null): void;
                setDirections(result: any): void;
            }
            class InfoWindow {
                constructor(opts?: any);
                open(map: Map, marker: Marker): void;
            }
            namespace SymbolPath {
                const CIRCLE: any;
            }
            enum TravelMode {
                DRIVING = 'DRIVING'
            }
            interface LatLngLiteral {
                lat: number;
                lng: number;
            }
            interface DirectionsWaypoint {
                location: LatLngLiteral | string;
                stopover?: boolean;
            }
        }
    }
}
