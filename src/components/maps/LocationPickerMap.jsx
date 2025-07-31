'use client'

import { useEffect, useRef, useState } from 'react'
import { logger } from '../../lib/logger.js'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat, toLonLat } from 'ol/proj'
import { defaults as defaultControls } from 'ol/control'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Style, Circle, Fill, Stroke } from 'ol/style'

// Coordenadas por defecto para Santa Rosa, Canelones, Uruguay
const DEFAULT_CENTER = [-56.0417, -34.5617]

const LocationPickerMap = ({ 
  initialLatitude, 
  initialLongitude, 
  onLocationChange, 
  className = "" 
}) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerLayerRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)

  // Usar coordenadas iniciales si están disponibles
  const hasInitialCoords = initialLatitude && initialLongitude && 
    !isNaN(parseFloat(initialLatitude)) && !isNaN(parseFloat(initialLongitude))

  const initialCenter = hasInitialCoords ? 
    [parseFloat(initialLongitude), parseFloat(initialLatitude)] : DEFAULT_CENTER

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    logger.map('Inicializando LocationPickerMap con OpenLayers')

    try {
      // Crear fuente de vector para el marcador
      const vectorSource = new VectorSource()
      
      // Crear capa de vector para marcadores
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          image: new Circle({
            radius: 12,
            fill: new Fill({ color: '#3498db' }),
            stroke: new Stroke({ color: '#ffffff', width: 3 })
          })
        })
      })

      markerLayerRef.current = vectorLayer

      // Crear mapa
      const map = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM({
              url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
          }),
          vectorLayer
        ],
        view: new View({
          center: fromLonLat(initialCenter),
          zoom: hasInitialCoords ? 15 : 13
        }),
        controls: defaultControls({
          zoom: true,
          rotate: false
        })
      })

      mapInstanceRef.current = map

      // Agregar marcador inicial si hay coordenadas
      if (hasInitialCoords) {
        const coordinate = fromLonLat([parseFloat(initialLongitude), parseFloat(initialLatitude)])
        const feature = new Feature({
          geometry: new Point(coordinate)
        })
        vectorSource.addFeature(feature)
        setCurrentLocation({
          lat: parseFloat(initialLatitude),
          lng: parseFloat(initialLongitude)
        })
        logger.success('Marcador inicial agregado:', initialLatitude, initialLongitude)
      }

      // Evento de click para seleccionar ubicación
      map.on('click', (event) => {
        const coordinate = toLonLat(event.coordinate)
        const location = {
          lat: coordinate[1],
          lng: coordinate[0]
        }

        logger.debug('Nueva ubicación seleccionada:', location)

        // Limpiar marcadores anteriores
        vectorSource.clear()

        // Agregar nuevo marcador
        const feature = new Feature({
          geometry: new Point(event.coordinate)
        })
        vectorSource.addFeature(feature)

        setCurrentLocation(location)

        // Notificar cambio
        if (onLocationChange) {
          onLocationChange(location.lat, location.lng)
        }
      })

      setIsLoaded(true)
              logger.success('LocationPickerMap inicializado')

    } catch (error) {
      console.error('❌ Error inicializando LocationPickerMap:', error)
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(null)
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Actualizar ubicación cuando cambian las props
  useEffect(() => {
    if (mapInstanceRef.current && markerLayerRef.current && hasInitialCoords) {
      const view = mapInstanceRef.current.getView()
      const coordinate = fromLonLat([parseFloat(initialLongitude), parseFloat(initialLatitude)])
      
      // Centrar mapa
      view.setCenter(coordinate)
      view.setZoom(15)

      // Actualizar marcador
      const vectorSource = markerLayerRef.current.getSource()
      vectorSource.clear()
      
      const feature = new Feature({
        geometry: new Point(coordinate)
      })
      vectorSource.addFeature(feature)

      setCurrentLocation({
        lat: parseFloat(initialLatitude),
        lng: parseFloat(initialLongitude)
      })
    }
  }, [initialLatitude, initialLongitude])

  const resetToDefault = () => {
    if (mapInstanceRef.current) {
      logger.debug('Reseteando LocationPickerMap')
      const view = mapInstanceRef.current.getView()
      view.setCenter(fromLonLat(DEFAULT_CENTER))
      view.setZoom(13)
      
      // Limpiar marcadores
      if (markerLayerRef.current) {
        markerLayerRef.current.getSource().clear()
      }
      
      setCurrentLocation(null)
      
      if (onLocationChange) {
        onLocationChange(null, null)
      }
    }
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div 
        ref={mapRef}
        className="w-full h-96 border border-gray-300 rounded-lg"
        style={{
          minHeight: '400px'
        }}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Cargando selector de ubicación...</p>
          </div>
        </div>
      )}

      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button
          onClick={resetToDefault}
          className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-1 rounded shadow text-sm"
          title="Limpiar selección"
        >
          🗑️ Limpiar
        </button>
      </div>

      {currentLocation && (
        <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded shadow text-xs text-blue-600">
          📍 Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
        </div>
      )}

      {isLoaded && (
        <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded shadow text-xs text-green-600">
          ✅ OpenLayers
        </div>
      )}

      <div className="mt-2 text-sm text-gray-600">
        💡 Haz click en el mapa para seleccionar una ubicación
      </div>
    </div>
  )
}

export default LocationPickerMap
