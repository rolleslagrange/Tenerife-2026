import fs from 'fs';
let code = fs.readFileSync('src/views/MapView.tsx', 'utf-8');

code = code.replace(
  "import { Plus, MapPin, Navigation, Trash2, Search, Loader2, Link as LinkIcon, Menu, X, Layers, List, ChevronDown } from 'lucide-react';",
  "import { Plus, MapPin, Navigation, Trash2, Search, Loader2, Link as LinkIcon, Menu, X, Layers, List, ChevronDown, Utensils, Camera, TreePine, ShoppingBag, Bed, Info, Filter } from 'lucide-react';"
);

fs.writeFileSync('src/views/MapView.tsx', code);
