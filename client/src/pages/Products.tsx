import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [stockFormData, setStockFormData] = useState({
    quantity: "",
    type: "IN",
    reason: "",
  });
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    variant: "",
    unitPrice: "",
    mrp: "",
    sellingPrice: "",
    stockQty: "",
    minStockLevel: "",
    warehouseLocation: ""
  });

  const { data: products = [], isLoading, error, refetch } = useQuery<any[]>({
    queryKey: ["/api/products"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/products', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        brand: "",
        category: "",
        variant: "",
        unitPrice: "",
        mrp: "",
        sellingPrice: "",
        stockQty: "",
        minStockLevel: "",
        warehouseLocation: ""
      });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PATCH', `/api/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/inventory-transactions', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-transactions'] });
      setIsStockDialogOpen(false);
      setSelectedProduct(null);
      setStockFormData({ quantity: "", type: "IN", reason: "" });
      toast({
        title: "Success",
        description: "Stock updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update stock",
        variant: "destructive",
      });
    },
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    const unitPrice = parseFloat(formData.unitPrice);
    const mrp = parseFloat(formData.mrp);
    const sellingPrice = parseFloat(formData.sellingPrice);
    const stockQty = parseInt(formData.stockQty);
    const minStockLevel = parseInt(formData.minStockLevel);
    
    if (!formData.name || !formData.brand || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(unitPrice) || unitPrice <= 0 || isNaN(mrp) || mrp <= 0 || isNaN(sellingPrice) || sellingPrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter valid prices greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(stockQty) || stockQty < 0 || isNaN(minStockLevel) || minStockLevel < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter valid stock quantities",
        variant: "destructive",
      });
      return;
    }
    
    createProductMutation.mutate({
      ...formData,
      unitPrice,
      mrp,
      sellingPrice,
      stockQty,
      minStockLevel,
    });
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      variant: product.variant || "",
      unitPrice: product.unitPrice?.toString() || "",
      mrp: product.mrp?.toString() || "",
      sellingPrice: product.sellingPrice?.toString() || "",
      stockQty: product.stockQty?.toString() || "",
      minStockLevel: product.minStockLevel?.toString() || "",
      warehouseLocation: product.warehouseLocation || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    const unitPrice = parseFloat(formData.unitPrice);
    const mrp = parseFloat(formData.mrp);
    const sellingPrice = parseFloat(formData.sellingPrice);
    const stockQty = parseInt(formData.stockQty);
    const minStockLevel = parseInt(formData.minStockLevel);
    
    if (!formData.name || !formData.brand || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(unitPrice) || unitPrice <= 0 || isNaN(mrp) || mrp <= 0 || isNaN(sellingPrice) || sellingPrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter valid prices greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(stockQty) || stockQty < 0 || isNaN(minStockLevel) || minStockLevel < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter valid stock quantities",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedProduct) {
      updateProductMutation.mutate({
        id: selectedProduct._id,
        data: {
          ...formData,
          unitPrice,
          mrp,
          sellingPrice,
          stockQty,
          minStockLevel,
        },
      });
    }
  };

  const handleManageStock = (product: any) => {
    setSelectedProduct(product);
    setStockFormData({ quantity: "", type: "IN", reason: "" });
    setIsStockDialogOpen(true);
  };

  const handleUpdateStock = (e: React.FormEvent) => {
    e.preventDefault();
    
    const quantity = parseInt(stockFormData.quantity);
    
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid quantity greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (!stockFormData.reason) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for the stock change",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedProduct) {
      updateStockMutation.mutate({
        productId: selectedProduct._id,
        type: stockFormData.type,
        quantity,
        reason: stockFormData.reason,
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...Array.from(new Set(products.map((p: any) => p.category)))];

  const getStatusBadge = (status: string, stock: number) => {
    switch (status) {
      case "in_stock":
        return <Badge variant="default" data-testid={`status-in-stock`}>In Stock ({stock})</Badge>;
      case "low_stock":
        return <Badge variant="secondary" data-testid={`status-low-stock`}>Low Stock ({stock})</Badge>;
      case "out_of_stock":
        return <Badge variant="destructive" data-testid={`status-out-of-stock`}>Out of Stock</Badge>;
      default:
        return <Badge variant="outline" data-testid={`status-${status}`}>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Products & Inventory</h1>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load products</h3>
              <p className="text-muted-foreground mb-4">
                {(error as Error)?.message || 'An error occurred while fetching products'}
              </p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products & Inventory</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your inventory
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-product-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                    data-testid="input-product-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    placeholder="e.g., Engine Parts, Brakes"
                    data-testid="input-product-category"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variant">Variant</Label>
                  <Input
                    id="variant"
                    value={formData.variant}
                    onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                    data-testid="input-product-variant"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price *</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    required
                    data-testid="input-product-unitprice"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mrp">MRP *</Label>
                  <Input
                    id="mrp"
                    type="number"
                    step="0.01"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    required
                    data-testid="input-product-mrp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price *</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    required
                    data-testid="input-product-sellingprice"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stockQty">Stock Quantity *</Label>
                  <Input
                    id="stockQty"
                    type="number"
                    value={formData.stockQty}
                    onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                    required
                    data-testid="input-product-stockqty"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStockLevel">Min Stock Level *</Label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                    required
                    data-testid="input-product-minstocklevel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warehouseLocation">Warehouse Location</Label>
                  <Input
                    id="warehouseLocation"
                    value={formData.warehouseLocation}
                    onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                    data-testid="input-product-warehouse"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  data-testid="button-cancel-product"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProductMutation.isPending}
                  data-testid="button-submit-product"
                >
                  {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat: string) => (
              <SelectItem key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product: any) => (
            <Card key={product._id} className="hover-elevate" data-testid={`card-product-${product._id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>
                  </div>
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" data-testid={`category-${product._id}`}>{product.category}</Badge>
                  {getStatusBadge(product.status, product.stockQty)}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">MRP</p>
                    <p className="text-sm line-through text-muted-foreground">{formatCurrency(product.mrp)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Selling Price</p>
                    <p className="text-lg font-bold">{formatCurrency(product.sellingPrice)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => handleEditProduct(product)}
                    data-testid={`button-edit-${product._id}`}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => handleManageStock(product)}
                    data-testid={`button-stock-${product._id}`}
                  >
                    Manage Stock
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No products match your search criteria</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No products found. Add your first product to get started.</p>
        </div>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="input-edit-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-brand">Brand *</Label>
                <Input
                  id="edit-brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                  data-testid="input-edit-brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  data-testid="input-edit-category"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-variant">Variant</Label>
                <Input
                  id="edit-variant"
                  value={formData.variant}
                  onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                  data-testid="input-edit-variant"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-unitPrice">Unit Price *</Label>
                <Input
                  id="edit-unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  required
                  data-testid="input-edit-unitprice"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-mrp">MRP *</Label>
                <Input
                  id="edit-mrp"
                  type="number"
                  step="0.01"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  required
                  data-testid="input-edit-mrp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sellingPrice">Selling Price *</Label>
                <Input
                  id="edit-sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  required
                  data-testid="input-edit-sellingprice"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-stockQty">Stock Quantity *</Label>
                <Input
                  id="edit-stockQty"
                  type="number"
                  value={formData.stockQty}
                  onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                  required
                  data-testid="input-edit-stockqty"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-minStockLevel">Min Stock Level *</Label>
                <Input
                  id="edit-minStockLevel"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                  required
                  data-testid="input-edit-minstocklevel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-warehouseLocation">Warehouse Location</Label>
                <Input
                  id="edit-warehouseLocation"
                  value={formData.warehouseLocation}
                  onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                  data-testid="input-edit-warehouse"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateProductMutation.isPending}
                data-testid="button-submit-edit"
              >
                {updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Stock Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Stock - {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Add or remove stock for this product
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStock} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stock-type">Transaction Type *</Label>
              <Select 
                value={stockFormData.type} 
                onValueChange={(value) => setStockFormData({ ...stockFormData, type: value })}
              >
                <SelectTrigger id="stock-type" data-testid="select-stock-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">Stock In (Add)</SelectItem>
                  <SelectItem value="OUT">Stock Out (Remove)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-quantity">Quantity *</Label>
              <Input
                id="stock-quantity"
                type="number"
                min="1"
                value={stockFormData.quantity}
                onChange={(e) => setStockFormData({ ...stockFormData, quantity: e.target.value })}
                required
                data-testid="input-stock-quantity"
              />
              <p className="text-sm text-muted-foreground">
                Current stock: {selectedProduct?.stockQty}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-reason">Reason *</Label>
              <Textarea
                id="stock-reason"
                value={stockFormData.reason}
                onChange={(e) => setStockFormData({ ...stockFormData, reason: e.target.value })}
                placeholder="E.g., Received from supplier, Damaged goods, etc."
                required
                data-testid="textarea-stock-reason"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsStockDialogOpen(false)}
                data-testid="button-cancel-stock"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateStockMutation.isPending}
                data-testid="button-submit-stock"
              >
                {updateStockMutation.isPending ? 'Updating...' : 'Update Stock'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
