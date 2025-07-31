'use client'

import { useEffect, useRef, useState } from 'react'
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
import { Style, Icon, Circle, Fill, Stroke } from 'ol/style'

const OpenLayersMap = ({ 
  clients = [], 
  onLocationSelect, 
  selectedLocation,
  height = '400px',
  width = '100%'
}) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const vectorLayerRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Coordenadas por defecto: Santa Rosa, Canelones, Uruguay
  const defaultCenter = [-56.0417, -34.5617]

  useEffect(() => {
    // Validaciones iniciales
    if (!mapRef.current || mapInstanceRef.current) return
    
    // Verificar que el elemento DOM tenga dimensiones
    if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
      console.warn('⚠️ Contenedor del mapa sin dimensiones, esperando...')
      return
    }

    console.log('🗺️ Inicializando OpenLayers...')

    // Dar tiempo para que el DOM se renderice
    const timer = setTimeout(() => {
      try {
        console.log('📐 Dimensiones del contenedor:', mapRef.current.offsetWidth, 'x', mapRef.current.offsetHeight)
        
        // Crear fuente de vector para marcadores
        const vectorSource = new VectorSource()
        
        // Crear capa de vector
        const vectorLayer = new VectorLayer({
          source: vectorSource,
          style: new Style({
            image: new Circle({
              radius: 8,
              fill: new Fill({ color: '#ff0000' }),
              stroke: new Stroke({ color: '#ffffff', width: 2 })
            })
          })
        })

        vectorLayerRef.current = vectorLayer

        // Crear mapa
        const map = new Map({
          target: mapRef.current,
          layers: [
            new TileLayer({
              source: new OSM({
                url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                crossOrigin: 'anonymous',
                attributions: '© OpenStreetMap contributors'
              })
            }),
            vectorLayer
          ],
          view: new View({
            center: fromLonLat(defaultCenter),
            zoom: 13,
            projection: 'EPSG:3857'
          }),
          controls: defaultControls({
            zoom: true,
            rotate: false,
            attribution: true
          })
        })

        mapInstanceRef.current = map

        // Forzar renderizado con validación
        setTimeout(() => {
          if (map && mapInstanceRef.current && mapRef.current) {
            try {
              map.updateSize()
              // Verificar que el mapa tenga un renderer antes de renderizar
              if (map.getRenderer()) {
                map.renderSync()
              }
              console.log('🔄 Mapa principal renderizado y redimensionado')
            } catch (renderError) {
              console.warn('⚠️ Error al renderizar mapa:', renderError)
            }
          }
        }, 100)

        // Agregar evento de click
        map.on('click', (event) => {
          const coordinate = toLonLat(event.coordinate)
          console.log('🎯 Click en mapa:', coordinate)
          
          if (onLocationSelect) {
            onLocationSelect({
              lat: coordinate[1],
              lng: coordinate[0]
            })
          }
        })

        // Agregar clientes como marcadores
        if (clients && clients.length > 0) {
          console.log('📍 Agregando marcadores:', clients.length)
          addClientMarkers(clients, vectorSource)
        }

        setIsLoaded(true)
        console.log('✅ OpenLayers inicializado correctamente')

      } catch (error) {
        console.error('❌ Error inicializando OpenLayers:', error)
      }
    }, 200)

    // Cleanup
    return () => {
      clearTimeout(timer)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(null)
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Función para agregar marcadores de clientes
  const addClientMarkers = (clientList, vectorSource) => {
    clientList.forEach((client, index) => {
      if (client.lat && client.lng) {
        const coordinate = fromLonLat([parseFloat(client.lng), parseFloat(client.lat)])
        
        const feature = new Feature({
          geometry: new Point(coordinate),
          client: client
        })

        vectorSource.addFeature(feature)
        console.log(`📍 Marcador agregado: ${client.nombre}`)
      }
    })
  }

  // Actualizar marcadores cuando cambian los clientes
  useEffect(() => {
    if (mapInstanceRef.current && vectorLayerRef.current && clients) {
      const vectorSource = vectorLayerRef.current.getSource()
      vectorSource.clear()
      addClientMarkers(clients, vectorSource)
    }
  }, [clients])

  // Actualizar ubicación seleccionada
  useEffect(() => {
    if (mapInstanceRef.current && selectedLocation) {
      const view = mapInstanceRef.current.getView()
      const coordinate = fromLonLat([selectedLocation.lng, selectedLocation.lat])
      view.setCenter(coordinate)
      view.setZoom(15)
    }
  }, [selectedLocation])

  const resetMap = () => {
    console.log('🔄 Reiniciando mapa...')
    if (mapInstanceRef.current) {
      const view = mapInstanceRef.current.getView()
      view.setCenter(fromLonLat(defaultCenter))
      view.setZoom(13)
      mapInstanceRef.current.updateSize()
    }
  }

  return (
    <div className="relative w-full">
      <div 
        ref={mapRef}
        className="map-container"
        style={{ 
          height: height,
          width: width,
          minHeight: '400px',
          border: '1px solid #ccc',
          borderRadius: '8px'
        }}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Cargando mapa...</p>
          </div>
        </div>
      )}

      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={resetMap}
          className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-1 rounded shadow-md text-sm border"
          title="Reiniciar vista del mapa"
        >
          🔄 Reset
        </button>
      </div>

      {isLoaded && (
        <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded shadow text-xs text-gray-600">
          ✅ OpenLayers activo
        </div>
      )}
    </div>
  )
}

export default OpenLayersMap
