import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Camera, CameraOff, Loader2, ShoppingCart } from "lucide-react";
import { API_URL } from "../config/api";
import Button from "../components/Button";
import useStore from "../store/useStore";
import styles from "./TryOn.module.css";

// Available glasses models with their correct scales
const GLASSES_MODELS = [
  {
    id: "demo",
    name: "Classic Frames",
    folder: "demo",
    scale: 0.006,
  },
  {
    id: "rayban-custom",
    name: "Rayban Aviator",
    folder: "rayban-custom",
    scale: 0.64,
  },
];

export default function TryOn() {
  const { id } = useParams();
  const { addToCart } = useStore();
  const canvasRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState(GLASSES_MODELS[0]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const jeelizInitialized = useRef(false);
  const threeStuffsRef = useRef(null);
  const currentGlassesRef = useRef(null);
  const currentOccluderRef = useRef(null);
  const threeCameraRef = useRef(null);

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        if (data.success) {
          setProducts(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    // Fetch product if id is provided (product ID, not model ID)
    const fetchProduct = async () => {
      if (id && id.length > 10) {
        // Product IDs are MongoDB ObjectIds (24 chars), model IDs are short
        try {
          const response = await fetch(`${API_URL}/products`);
          const data = await response.json();
          if (data.success) {
            const foundProduct = data.data.find((p) => p._id === id || p.id === id);
            if (foundProduct) {
              setProduct(foundProduct);
              // Try to find matching model
              const model = GLASSES_MODELS.find((m) => 
                foundProduct.name.toLowerCase().includes(m.name.toLowerCase()) ||
                foundProduct.glassesModelId?.name?.includes(m.folder)
              );
              if (model) setSelectedModel(model);
            }
          }
        } catch (err) {
          console.error("Error fetching product:", err);
        }
      } else {
        // It's a model ID
        const model = GLASSES_MODELS.find((m) => m.id === id);
        if (model) setSelectedModel(model);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    return () => {
      if (window.JEELIZFACEFILTER && jeelizInitialized.current) {
        try {
          window.JEELIZFACEFILTER.destroy();
        } catch (e) {
          console.error("Error destroying Jeeliz:", e);
        }
      }
    };
  }, []);

  const loadScripts = () => {
    return new Promise((resolve, reject) => {
      if (window.JEELIZFACEFILTER && window.THREE && window.JeelizThreeHelper) {
        resolve();
        return;
      }

      const loadScript = (src) => {
        return new Promise((res, rej) => {
          const existing = document.querySelector(`script[src="${src}"]`);
          if (existing) {
            res();
            return;
          }
          const script = document.createElement("script");
          script.src = src;
          script.onload = () => setTimeout(res, 50);
          script.onerror = () => rej(new Error(`Failed to load ${src}`));
          document.head.appendChild(script);
        });
      };

      loadScript(`${API_URL}/static/dist/jeelizFaceFilter.js`)
        .then(() => loadScript(`${API_URL}/static/libs/three/v112/three.js`))
        .then(() => loadScript(`${API_URL}/static/helpers/JeelizThreeHelper.js`))
        .then(() => loadScript(`${API_URL}/static/helpers/JeelizResizer.js`))
        .then(resolve)
        .catch(reject);
    });
  };

  // EXACT copy of JeelizThreeGlassesCreator from the demo
  const JeelizThreeGlassesCreator = (spec) => {
    const THREE = window.THREE;
    const threeGlasses = new THREE.Object3D();

    const textureEquirec = new THREE.TextureLoader().load(spec.envMapURL);
    textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
    textureEquirec.magFilter = THREE.LinearFilter;
    textureEquirec.minFilter = THREE.LinearMipMapLinearFilter;

    // Load frame
    new THREE.BufferGeometryLoader().load(spec.frameMeshURL, function (geometry) {
      geometry.computeVertexNormals();

      const uniforms = {
        roughness: { value: 0 },
        metalness: { value: 0.05 },
        reflectivity: { value: 1 },
        envMap: { value: textureEquirec },
        envMapIntensity: { value: 1 },
        diffuse: { value: new THREE.Color().setHex(0xffffff) },
        uBranchFading: { value: new THREE.Vector2(-90, 60) },
      };

      let vertexShaderSource = "varying float vPosZ;\n" + THREE.ShaderLib.standard.vertexShader;
      vertexShaderSource = vertexShaderSource.replace("#include <fog_vertex>", "vPosZ = position.z;");

      let fragmentShaderSource = "uniform vec2 uBranchFading;\n varying float vPosZ;\n" + THREE.ShaderLib.standard.fragmentShader;
      const GLSLcomputeAlpha = "gl_FragColor.a = smoothstep(uBranchFading.x - uBranchFading.y*0.5, uBranchFading.x + uBranchFading.y*0.5, vPosZ);";
      fragmentShaderSource = fragmentShaderSource.replace("#include <fog_fragment>", GLSLcomputeAlpha);

      const mat = new THREE.ShaderMaterial({
        vertexShader: vertexShaderSource,
        fragmentShader: fragmentShaderSource,
        uniforms: uniforms,
        flatShading: false,
        transparent: true,
      });

      mat.envMap = textureEquirec;
      const mesh = new THREE.Mesh(geometry, mat);
      threeGlasses.add(mesh);
    });

    // Load lenses
    new THREE.BufferGeometryLoader().load(spec.lensesMeshURL, function (geometry) {
      if (geometry.attributes.position && geometry.attributes.position.count > 0) {
        geometry.computeVertexNormals();
        const mat = new THREE.MeshBasicMaterial({
          envMap: textureEquirec,
          opacity: 0.7,
          color: new THREE.Color().setHex(0x2233aa),
          transparent: true,
          fog: false,
        });
        const mesh = new THREE.Mesh(geometry, mat);
        threeGlasses.add(mesh);
      }
    });

    const occluderMesh = window.JeelizThreeHelper.create_threejsOccluder(spec.occluderURL);

    return {
      glasses: threeGlasses,
      occluder: occluderMesh,
    };
  };

  // EXACT copy of init_threeScene from the demo
  const initThreeScene = (spec, modelConfig) => {
    const THREE = window.THREE;

    const threeStuffs = window.JeelizThreeHelper.init(spec, (faceIndex, isDetected) => {
      setFaceDetected(isDetected);
    });

    threeStuffs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    threeStuffs.renderer.outputEncoding = THREE.sRGBEncoding;

    const basePath = `${API_URL}/static/models/glasses/${modelConfig.folder}`;

    const r = JeelizThreeGlassesCreator({
      envMapURL: `${basePath}/envMap.jpg`,
      frameMeshURL: `${basePath}/frame.json`,
      lensesMeshURL: `${basePath}/lenses.json`,
      occluderURL: `${basePath}/occluder.json`,
    });

    const dy = 0.07;

    // Add occluder
    r.occluder.rotation.set(0.3, 0, 0);
    r.occluder.position.set(0, 0.03 + dy, -0.04);
    r.occluder.scale.multiplyScalar(0.0084);
    threeStuffs.faceObject.add(r.occluder);

    // Add glasses with model-specific scale
    const threeGlasses = r.glasses;
    threeGlasses.position.set(0, dy, 0.4);
    threeGlasses.scale.multiplyScalar(modelConfig.scale);
    threeStuffs.faceObject.add(threeGlasses);

    threeStuffsRef.current = threeStuffs;
    currentGlassesRef.current = threeGlasses;
    currentOccluderRef.current = r.occluder;
    threeCameraRef.current = window.JeelizThreeHelper.create_camera();
  };

  // EXACT copy of main() and init_faceFilter from the demo
  const startCamera = async () => {
    if (isInitializing) return;

    // Clean up any existing instance
    if (window.JEELIZFACEFILTER && jeelizInitialized.current) {
      try {
        window.JEELIZFACEFILTER.destroy();
        jeelizInitialized.current = false;
      } catch (e) {
        console.warn("Error destroying Jeeliz:", e);
      }
    }

    setIsInitializing(true);
    setError(null);

    try {
      await loadScripts();

      if (!canvasRef.current) {
        setError("Canvas not found");
        setIsInitializing(false);
        return;
      }

      const canvas = canvasRef.current;
      
      // Ensure canvas is in DOM and visible
      if (!canvas || !canvas.parentElement) {
        setError("Canvas not ready. Please wait a moment and try again.");
        setIsInitializing(false);
        return;
      }

      // Ensure canvas is visible and has dimensions
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        setError("Canvas is not visible. Please ensure the camera container is displayed.");
        setIsInitializing(false);
        return;
      }

      console.log("Starting camera initialization...");
      console.log("Canvas:", canvas.id, rect.width, "x", rect.height);

      // Test camera access first to ensure permissions are granted
      // This helps avoid WEBCAM_UNAVAILABLE errors
      let cameraTestStream = null;
      try {
        console.log("Testing camera access...");
        cameraTestStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } 
        });
        console.log("✅ Camera access test successful");
        // Release immediately
        cameraTestStream.getTracks().forEach(track => track.stop());
        cameraTestStream = null;
        // Wait a moment for camera to be fully released
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (err) {
        console.error("Camera test failed:", err);
        if (err.name === 'NotAllowedError') {
          setError("Camera permission denied.\n\nPlease:\n1. Click the lock icon in your browser address bar\n2. Set Camera to 'Allow'\n3. Refresh the page");
          setIsInitializing(false);
          return;
        } else if (err.name === 'NotFoundError') {
          setError("No camera found.\n\nPlease:\n1. Connect a camera\n2. Refresh the page");
          setIsInitializing(false);
          return;
        } else if (err.name === 'NotReadableError') {
          setError("Camera is being used by another app.\n\nPlease:\n1. Close Zoom, FaceTime, Photo Booth, etc.\n2. Refresh the page");
          setIsInitializing(false);
          return;
        }
        // For other errors, continue - Jeeliz might still work
      }

      // EXACT same as demo: JeelizResizer.size_canvas
      window.JeelizResizer.size_canvas({
        canvasId: canvasRef.current.id,
        callback: (isError, bestVideoSettings) => {
          if (isError) {
            console.error("JeelizResizer error:", isError);
            setError("Failed to initialize camera");
            setIsInitializing(false);
            return;
          }

          console.log("✅ Canvas sized, initializing JEELIZFACEFILTER...");

          // EXACT same as demo: JEELIZFACEFILTER.init
          window.JEELIZFACEFILTER.init({
            followZRot: true,
            canvasId: canvasRef.current.id,
            NNCPath: `${API_URL}/static/neuralNets/`,
            maxFacesDetected: 1,
            callbackReady: (errCode, spec) => {
              if (errCode) {
                console.log("AN ERROR HAPPENS. ERR =", errCode);
                
                let errorMsg = "Camera error";
                if (typeof errCode === 'string') {
                  if (errCode === 'WEBCAM_UNAVAILABLE') {
                    errorMsg = "Camera is not available.\n\n" +
                      "Please try:\n" +
                      "1. Refresh the page\n" +
                      "2. Check camera permissions in browser settings\n" +
                      "3. Close other apps using the camera\n" +
                      "4. Make sure camera is connected";
                  } else {
                    errorMsg = `Camera error: ${errCode}`;
                  }
                } else {
                  errorMsg = `Camera error (code: ${errCode})`;
                }
                
                setError(errorMsg);
                setIsInitializing(false);
                return;
              }

              console.log("INFO: JEELIZFACEFILTER IS READY");
              jeelizInitialized.current = true;
              initThreeScene(spec, selectedModel);
              setIsCameraOn(true);
              setIsInitializing(false);
            },
            callbackTrack: (detectState) => {
              if (window.JeelizThreeHelper && threeCameraRef.current) {
                window.JeelizThreeHelper.render(detectState, threeCameraRef.current);
              }
            },
          });
        },
      });
    } catch (err) {
      console.error("Camera initialization error:", err);
      setError(err.message || "Failed to start camera");
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (window.JEELIZFACEFILTER && jeelizInitialized.current) {
      try {
        window.JEELIZFACEFILTER.destroy();
        jeelizInitialized.current = false;
      } catch (e) {
        console.error("Error stopping camera:", e);
      }
    }
    setIsCameraOn(false);
    setFaceDetected(false);
  };

  const handleModelSelect = (model) => {
    const wasOn = isCameraOn;
    if (wasOn) stopCamera();
    setSelectedModel(model);
    if (wasOn) setTimeout(startCamera, 300);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation(); // Prevent triggering product selection
    addToCart(product);
    // Show a brief feedback (you could add a toast notification here)
    console.log("Added to cart:", product.name);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    
    // Try to find matching model for this product
    let matchingModel = null;
    
    // First, try to match by product name or brand
    matchingModel = GLASSES_MODELS.find((m) => 
      product.name.toLowerCase().includes(m.name.toLowerCase()) ||
      product.name.toLowerCase().includes(m.folder.toLowerCase()) ||
      (product.glassesModelId?.name && product.glassesModelId.name.includes(m.folder))
    );
    
    // If no match found, use default model
    if (!matchingModel) {
      matchingModel = GLASSES_MODELS[0]; // Default to first model
      console.log(`No matching model found for ${product.name}, using default model`);
    }
    
    // Update selected model and restart camera if it's on
    const wasOn = isCameraOn;
    if (wasOn) stopCamera();
    setSelectedModel(matchingModel);
    if (wasOn) {
      setTimeout(() => {
        startCamera();
      }, 300);
    }
  };

  return (
    <div className={styles.page}>
      <div className="container" style={{ maxWidth: '100%', padding: '0 1rem' }}>
        <h1 className={styles.title}>Virtual Try-On</h1>

        {error && (
          <div className={styles.error}>
            <p className={styles.errorTitle}>Error</p>
            <p className={styles.errorMessage} style={{ whiteSpace: "pre-line" }}>
              {error}
            </p>
            <div className={styles.errorActions}>
              <Button onClick={() => setError(null)} variant="outline" size="sm">
                Dismiss
              </Button>
              <Button onClick={startCamera} size="sm">
                Try Again
              </Button>
            </div>
          </div>
        )}

        <div className={styles.tryOnLayout}>
          <div className={styles.cameraSection}>
            <div className={styles.cameraContainer}>
          <canvas ref={canvasRef} id="jeeFaceFilterCanvas" className={styles.canvas} />

          {!isCameraOn && (
            <div className={styles.cameraOff}>
              <Camera size={64} />
              <h2>Start Virtual Try-On</h2>
              <p>See how glasses look on you in real-time</p>
              <div className={styles.selectedModel}>
                <span>Selected:</span>
                <strong>{selectedModel.name}</strong>
              </div>
              <Button onClick={startCamera} disabled={isInitializing} size="lg">
                {isInitializing ? (
                  <>
                    <Loader2 size={20} className={styles.spinner} />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Camera size={20} />
                    Start Camera
                  </>
                )}
              </Button>
            </div>
          )}

          {isCameraOn && (
            <div className={styles.cameraControls}>
              <div className={`${styles.status} ${faceDetected ? styles.faceDetected : styles.faceSearching}`}>
                {faceDetected ? "✓ Face Detected" : "Searching for face..."}
              </div>
              <Button onClick={stopCamera} variant="outline" size="sm">
                <CameraOff size={18} />
                Stop
              </Button>
            </div>
          )}
            </div>
          </div>

          {/* Products List on Right */}
          <div className={styles.productsSection}>
            <h3 className={styles.productsTitle}>Available Products</h3>
            
            {productsLoading ? (
              <div className={styles.loading}>Loading products...</div>
            ) : products.length === 0 ? (
              <div className={styles.empty}>No products available</div>
            ) : (
              <div className={styles.productsList}>
                {products.map((prod) => {
                  const productId = prod._id || prod.id;
                  const selectedId = selectedProduct ? (selectedProduct._id || selectedProduct.id) : null;
                  const isSelected = selectedId && productId && selectedId.toString() === productId.toString();
                  return (
                    <div 
                      key={prod._id || prod.id} 
                      className={`${styles.productCard} ${isSelected ? styles.productSelected : ''}`}
                      onClick={() => handleProductSelect(prod)}
                    >
                      <div className={styles.productImage}>
                        {prod.images && prod.images.length > 0 ? (
                          <img
                            src={`${API_URL}/static/${prod.images[0]}`}
                            alt={prod.name}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML = '<div style="font-size: 2rem; display: flex; align-items: center; justify-content: center; height: 100%;">👓</div>';
                            }}
                          />
                        ) : (
                          <div className={styles.noImage}>👓</div>
                        )}
                        {isSelected && (
                          <div className={styles.selectedBadge}>
                            <span>Selected</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.productDetails}>
                        <h4 className={styles.productName}>{prod.name}</h4>
                        <p className={styles.productBrand}>{prod.brand}</p>
                        <p className={styles.productPrice}>${prod.price}</p>
                        <Button
                          onClick={(e) => handleAddToCart(prod, e)}
                          size="sm"
                          className={styles.addToCartBtn}
                        >
                          <ShoppingCart size={16} />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
