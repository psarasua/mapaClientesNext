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
import { Style, Circle, Fill, Stroke } from 'ol/style'

const ClientMapComponent = ({ client, onLocationSelect }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Coordenadas por defecto: Santa Rosa, Canelones, Uruguay
  const defaultCenter = [-56.0417, -34.5617]
  const clientCenter = client?.lat && client?.lng ? 
    [parseFloat(client.lng), parseFloat(client.lat)] : defaultCenter

  useEffect(() => {
    // Validaciones iniciales
    if (!mapRef.current || mapInstanceRef.current) return
    
    // Verificar que el elemento DOM tenga dimensiones
    if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
      console.warn('⚠️ Contenedor del mapa sin dimensiones, esperando...')
      return
    }

    console.log('🗺️ Inicializando mapa OpenLayers del cliente:', client?.nombre)

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
              radius: 10,
              fill: new Fill({ color: '#ff4444' }),
              stroke: new Stroke({ color: '#ffffff', width: 3 })
            })
          })
        })

        // Crear mapa
        const map = new Map({
          target: mapRef.current,
          layers: [
            new TileLayer({
              source: new OSM({
                url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                crossOrigin: 'anonymous'
              })
            }),
            vectorLayer
          ],
          view: new View({
            center: fromLonLat(clientCenter),
            zoom: client?.lat && client?.lng ? 15 : 13,
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
              console.log('🔄 Mapa renderizado y redimensionado')
            } catch (renderError) {
              console.warn('⚠️ Error al renderizar mapa:', renderError)
            }
          }
        }, 100)

        // Agregar marcador del cliente si tiene coordenadas
        if (client?.lat && client?.lng) {
          const coordinate = fromLonLat([parseFloat(client.lng), parseFloat(client.lat)])
          const feature = new Feature({
            geometry: new Point(coordinate),
            client: client
          })
          vectorSource.addFeature(feature)
          console.log('📍 Marcador OpenLayers agregado para:', client.nombre)
        }

        // Evento de click
        map.on('click', (event) => {
          const coordinate = toLonLat(event.coordinate)
          console.log('🎯 Click en mapa OpenLayers:', coordinate)
          
          if (onLocationSelect) {
            onLocationSelect({
              lat: coordinate[1],
              lng: coordinate[0]
            })
          }
        })

        setIsLoaded(true)
        console.log('✅ Mapa OpenLayers del cliente inicializado')

      } catch (error) {
        console.error('❌ Error inicializando mapa OpenLayers del cliente:', error)
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

  // Actualizar centro cuando cambia el cliente
  useEffect(() => {
    if (mapInstanceRef.current && client?.lat && client?.lng) {
      const view = mapInstanceRef.current.getView()
      const coordinate = fromLonLat([parseFloat(client.lng), parseFloat(client.lat)])
      view.setCenter(coordinate)
      view.setZoom(15)
    }
  }, [client])

  const resetMap = () => {
    if (mapInstanceRef.current) {
      console.log('🔄 Reiniciando mapa OpenLayers del cliente')
      const view = mapInstanceRef.current.getView()
      view.setCenter(fromLonLat(clientCenter))
      view.setZoom(client?.lat && client?.lng ? 15 : 13)
      mapInstanceRef.current.updateSize()
    }
  }

  return (
    <div className="relative w-full">
      <div 
        ref={mapRef}
        className="map-container"
        style={{
          width: '100%',
          height: '400px',
          minHeight: '400px',
          border: '1px solid #ccc',
          borderRadius: '8px'
        }}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Cargando mapa OpenLayers...</p>
          </div>
        </div>
      )}

      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={resetMap}
          className="bg-white hover:bg-gray-50 text-gray-700 px-2 py-1 rounded shadow text-xs"
          title="Reiniciar mapa"
        >
          🔄
        </button>
      </div>

      {isLoaded && (
        <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded shadow text-xs text-green-600">
          ✅ OpenLayers
        </div>
      )}
    </div>
  )
}

export default ClientMapComponent
