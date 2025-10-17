import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Minus, Tag, Calculator, Receipt } from "lucide-react";

const invoiceItemSchema = z.object({
  type: z.enum(['product', 'service']),
  productId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Price must be positive"),
  total: z.number(),
  hasWarranty: z.boolean().default(false),
});

const invoiceFormSchema = z.object({
  items: z.array(invoiceItemSchema).min(1, "Add at least one item"),
  couponCode: z.string().optional(),
  taxRate: z.number().default(18),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface InvoiceGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceVisit: any;
}

export function InvoiceGenerationDialog({ open, onOpenChange, serviceVisit }: InvoiceGenerationDialogProps) {
  const { toast } = useToast();
  const [couponValidation, setCouponValidation] = useState<any>(null);
  const [calculatedTotals, setCalculatedTotals] = useState({
    subtotal: 0,
    discount: 0,
    taxAmount: 0,
    total: 0,
  });

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      items: serviceVisit?.partsUsed?.length > 0
        ? serviceVisit.partsUsed.map((part: any) => ({
            type: 'product' as const,
            productId: part.productId?._id || part.productId,
            name: part.productId?.name || 'Product',
            quantity: part.quantity || 1,
            unitPrice: part.price || 0,
            total: (part.quantity || 1) * (part.price || 0),
            hasWarranty: false,
          }))
        : [{
            type: 'service' as const,
            name: 'Service Charge',
            quantity: 1,
            unitPrice: 0,
            total: 0,
            hasWarranty: false,
          }],
      taxRate: 18,
      couponCode: '',
      notes: '',
      terms: 'Payment due within 30 days',
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const items = form.watch('items');
  const couponCode = form.watch('couponCode');
  const taxRate = form.watch('taxRate');

  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const discount = couponValidation?.coupon?.discountAmount || 0;
    const amountAfterDiscount = subtotal - discount;
    const taxAmount = (amountAfterDiscount * taxRate) / 100;
    const total = amountAfterDiscount + taxAmount;

    setCalculatedTotals({
      subtotal,
      discount,
      taxAmount,
      total,
    });
  }, [items, couponValidation, taxRate]);

  const validateCouponMutation = useMutation({
    mutationFn: (code: string) =>
      apiRequest('/api/coupons/validate', 'POST', {
        code,
        customerId: serviceVisit.customerId._id,
        purchaseAmount: calculatedTotals.subtotal,
      }),
    onSuccess: (data: any) => {
      setCouponValidation(data);
      toast({ title: "Coupon applied successfully", description: `Discount: ₹${data.coupon.discountAmount}` });
    },
    onError: (error: any) => {
      setCouponValidation(null);
      toast({ title: "Invalid coupon", description: error.message, variant: "destructive" });
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (data: InvoiceFormValues) =>
      apiRequest('/api/invoices/from-service-visit', 'POST', {
        serviceVisitId: serviceVisit._id,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/service-visits'] });
      toast({ title: "Invoice created successfully", description: "Invoice sent for approval" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create invoice", variant: "destructive" });
    },
  });

  const addItem = () => {
    const currentItems = form.getValues('items');
    form.setValue('items', [
      ...currentItems,
      {
        type: 'product' as const,
        name: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
        hasWarranty: false,
      },
    ]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues('items');
    form.setValue('items', currentItems.filter((_, i) => i !== index));
  };

  const updateItemTotal = (index: number) => {
    const items = form.getValues('items');
    const item = items[index];
    const total = item.quantity * item.unitPrice;
    form.setValue(`items.${index}.total`, total);
  };

  const applyCoupon = () => {
    const code = form.getValues('couponCode');
    if (code) {
      validateCouponMutation.mutate(code);
    }
  };

  const onSubmit = (data: InvoiceFormValues) => {
    createInvoiceMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-generate-invoice">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Generate Invoice
          </DialogTitle>
          <DialogDescription>
            Create invoice for service visit - {serviceVisit?.vehicleReg || 'N/A'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Items & Services</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addItem} data-testid="button-add-item">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Warranty</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`items.${index}.type`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                      <SelectTrigger className="w-[120px]" data-testid={`select-item-type-${index}`}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="product">Product</SelectItem>
                                        <SelectItem value="service">Service</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`items.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Input {...field} placeholder="Item name" data-testid={`input-item-name-${index}`} />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(parseFloat(e.target.value) || 0);
                                        updateItemTotal(index);
                                      }}
                                      className="w-20"
                                      data-testid={`input-item-quantity-${index}`}
                                    />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`items.${index}.unitPrice`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(parseFloat(e.target.value) || 0);
                                        updateItemTotal(index);
                                      }}
                                      className="w-24"
                                      data-testid={`input-item-price-${index}`}
                                    />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>₹{item.total.toLocaleString()}</TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`items.${index}.hasWarranty`}
                                render={({ field }) => (
                                  <FormItem>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="h-4 w-4"
                                      data-testid={`checkbox-warranty-${index}`}
                                    />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              {items.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(index)}
                                  data-testid={`button-remove-item-${index}`}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Discount & Tax</h3>
                  
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="couponCode"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Coupon Code</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter coupon code" data-testid="input-coupon-code" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="self-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={applyCoupon}
                        disabled={!couponCode || validateCouponMutation.isPending}
                        data-testid="button-apply-coupon"
                      >
                        <Tag className="h-4 w-4 mr-1" />
                        Apply
                      </Button>
                    </div>
                  </div>

                  {couponValidation && (
                    <Badge variant="default" data-testid="badge-coupon-applied">
                      Coupon Applied: {couponValidation.coupon.discountType === 'percentage'
                        ? `${couponValidation.coupon.discountValue}% off`
                        : `₹${couponValidation.coupon.discountValue} off`}
                    </Badge>
                  )}

                  <FormField
                    control={form.control}
                    name="taxRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Rate (GST %)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-tax-rate"
                          />
                        </FormControl>
                        <FormDescription>Default GST rate is 18%</FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold" data-testid="text-subtotal">₹{calculatedTotals.subtotal.toLocaleString()}</span>
                    </div>
                    {calculatedTotals.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span className="font-semibold" data-testid="text-discount">-₹{calculatedTotals.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tax ({taxRate}%):</span>
                      <span className="font-semibold" data-testid="text-tax">₹{calculatedTotals.taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span data-testid="text-total">₹{calculatedTotals.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Additional notes..." data-testid="textarea-notes" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms & Conditions</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Payment terms and conditions..." data-testid="textarea-terms" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-invoice"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createInvoiceMutation.isPending}
                data-testid="button-create-invoice"
              >
                {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
