import type { Express } from "express";
import { createServer, type Server } from "http";
import { connectDB } from "./db";
import { Product } from "./models/Product";
import { Customer } from "./models/Customer";
import { Employee } from "./models/Employee";
import { ServiceVisit } from "./models/ServiceVisit";
import { Order } from "./models/Order";
import { InventoryTransaction } from "./models/InventoryTransaction";
import { ProductReturn } from "./models/ProductReturn";
import { Notification } from "./models/Notification";
import { Supplier } from "./models/Supplier";
import { PurchaseOrder } from "./models/PurchaseOrder";
import { Attendance } from "./models/Attendance";
import { Leave } from "./models/Leave";
import { Task } from "./models/Task";
import { CommunicationLog } from "./models/CommunicationLog";
import { Feedback } from "./models/Feedback";
import { checkAndNotifyLowStock, notifyNewOrder, notifyServiceVisitStatus, notifyPaymentOverdue, notifyPaymentDue } from "./utils/notifications";
import { User } from "./models/User";
import { authenticateUser, createUser, ROLE_PERMISSIONS } from "./auth";
import { requireAuth, requireRole, attachUser, requirePermission } from "./middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  await connectDB();
  
  app.use(attachUser);

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      (req as any).session.userId = user._id.toString();
      (req as any).session.userRole = user.role;
      (req as any).session.userName = user.name;
      (req as any).session.userEmail = user.email;
      
      res.json({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      res.status(400).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const user = await User.findById(userId).select('-passwordHash');
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || {},
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // User management endpoints (Admin only)
  app.post("/api/users", requireAuth, requireRole('Admin'), async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      
      if (!email || !password || !name || !role) {
        return res.status(400).json({ error: "All fields are required" });
      }
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      
      const user = await createUser(email, password, name, role);
      
      res.json({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      });
    } catch (error) {
      res.status(400).json({ error: "Failed to create user" });
    }
  });

  app.get("/api/users", requireAuth, requireRole('Admin'), async (req, res) => {
    try {
      const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/users/:id", requireAuth, requireRole('Admin'), async (req, res) => {
    try {
      const { name, role, isActive } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, role, isActive },
        { new: true }
      ).select('-passwordHash');
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", requireAuth, requireRole('Admin'), async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Prevent admins from deleting themselves
      if (userId === (req as any).session.userId) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }
      
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete user" });
    }
  });

  // Products endpoints with permission checks
  app.get("/api/products", requireAuth, requirePermission('products', 'read'), async (req, res) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", requireAuth, requirePermission('products', 'create'), async (req, res) => {
    try {
      const product = await Product.create(req.body);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", requireAuth, requirePermission('products', 'update'), async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireAuth, requirePermission('products', 'delete'), async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete product" });
    }
  });

  // Customers endpoints with permission checks
  app.get("/api/customers", requireAuth, requirePermission('customers', 'read'), async (req, res) => {
    try {
      const customers = await Customer.find().sort({ createdAt: -1 });
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", requireAuth, requirePermission('customers', 'create'), async (req, res) => {
    try {
      const customer = await Customer.create(req.body);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: "Failed to create customer" });
    }
  });

  app.patch("/api/customers/:id", requireAuth, requirePermission('customers', 'update'), async (req, res) => {
    try {
      const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", requireAuth, requirePermission('customers', 'delete'), async (req, res) => {
    try {
      const customer = await Customer.findByIdAndDelete(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete customer" });
    }
  });

  // Employees endpoints with permission checks
  app.get("/api/employees", requireAuth, requirePermission('employees', 'read'), async (req, res) => {
    try {
      const employees = await Employee.find().sort({ createdAt: -1 });
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", requireAuth, requirePermission('employees', 'create'), async (req, res) => {
    try {
      const employee = await Employee.create(req.body);
      res.json(employee);
    } catch (error) {
      res.status(400).json({ error: "Failed to create employee" });
    }
  });

  app.patch("/api/employees/:id", requireAuth, requirePermission('employees', 'update'), async (req, res) => {
    try {
      const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(400).json({ error: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", requireAuth, requirePermission('employees', 'delete'), async (req, res) => {
    try {
      const employee = await Employee.findByIdAndDelete(req.params.id);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete employee" });
    }
  });

  // Service handlers endpoint - accessible to all authenticated users
  app.get("/api/service-handlers", requireAuth, async (req, res) => {
    try {
      const handlers = await Employee.find({
        role: { $in: ['Admin', 'Service Staff'] },
        isActive: true
      }).sort({ name: 1 });
      res.json(handlers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service handlers" });
    }
  });

  // Service visits - use 'orders' resource for permissions (Service Staff can read/update)
  app.get("/api/service-visits", requireAuth, requirePermission('orders', 'read'), async (req, res) => {
    try {
      const visits = await ServiceVisit.find()
        .populate('customerId')
        .populate('handlerId')
        .populate('partsUsed.productId')
        .sort({ createdAt: -1 });
      res.json(visits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service visits" });
    }
  });

  app.post("/api/service-visits", requireAuth, requirePermission('orders', 'create'), async (req, res) => {
    try {
      const visit = await ServiceVisit.create(req.body);
      await visit.populate('customerId');
      await visit.populate('handlerId');
      
      // Notify about new service visit
      const customerName = visit.customerId?.name || 'Unknown Customer';
      await notifyServiceVisitStatus(visit, customerName, visit.status);
      
      res.json(visit);
    } catch (error) {
      res.status(400).json({ error: "Failed to create service visit" });
    }
  });

  app.patch("/api/service-visits/:id", requireAuth, requirePermission('orders', 'update'), async (req, res) => {
    try {
      const previousVisit = await ServiceVisit.findById(req.params.id).populate('customerId');
      const visit = await ServiceVisit.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate('customerId')
        .populate('handlerId');
      if (!visit) {
        return res.status(404).json({ error: "Service visit not found" });
      }
      
      // Update customer loyalty when visit is completed
      if (req.body.status === 'completed' && previousVisit?.status !== 'completed' && visit.customerId) {
        const customer = await Customer.findById(visit.customerId._id);
        if (customer) {
          customer.visitCount += 1;
          customer.totalSpent += visit.totalAmount || 0;
          customer.calculateLoyaltyTier();
          await customer.save();
        }
      }
      
      // Notify about service visit status change
      if (req.body.status && previousVisit && req.body.status !== previousVisit.status) {
        const customerName = visit.customerId?.name || 'Unknown Customer';
        await notifyServiceVisitStatus(visit, customerName, req.body.status);
      }
      
      res.json(visit);
    } catch (error) {
      res.status(400).json({ error: "Failed to update service visit" });
    }
  });

  app.delete("/api/service-visits/:id", requireAuth, requirePermission('orders', 'delete'), async (req, res) => {
    try {
      const visit = await ServiceVisit.findByIdAndDelete(req.params.id);
      if (!visit) {
        return res.status(404).json({ error: "Service visit not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete service visit" });
    }
  });

  // Orders endpoints with permission checks
  app.get("/api/orders", requireAuth, requirePermission('orders', 'read'), async (req, res) => {
    try {
      const orders = await Order.find()
        .populate('customerId')
        .populate('items.productId')
        .populate('salespersonId')
        .sort({ createdAt: -1 });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", requireAuth, requirePermission('orders', 'create'), async (req, res) => {
    try {
      // Apply customer loyalty discount if applicable
      let orderData = req.body;
      if (req.body.customerId && req.body.customerId !== 'walk-in') {
        const customer = await Customer.findById(req.body.customerId);
        if (customer && customer.discountPercentage > 0) {
          const discount = (orderData.total * customer.discountPercentage) / 100;
          orderData = {
            ...orderData,
            discount: discount,
            total: orderData.total - discount,
          };
        }
      }
      
      const order = await Order.create(orderData);
      
      for (const item of req.body.items) {
        const updatedProduct = await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockQty: -item.quantity } },
          { new: true }
        );
        
        await InventoryTransaction.create({
          productId: item.productId,
          type: 'OUT',
          quantity: item.quantity,
          reason: `Order ${order.invoiceNumber}`,
        });
        
        // Check for low stock after order
        if (updatedProduct) {
          await checkAndNotifyLowStock(updatedProduct);
        }
      }
      
      await order.populate('customerId');
      await order.populate('items.productId');
      
      // Update customer loyalty points and spending
      if (order.customerId && order.customerId !== 'walk-in') {
        const customer = await Customer.findById(order.customerId._id);
        if (customer) {
          customer.totalSpent += order.total || 0;
          customer.calculateLoyaltyTier();
          await customer.save();
        }
      }
      
      // Notify about new order
      const customerName = order.customerId?.name || 'Unknown Customer';
      await notifyNewOrder(order, customerName);
      
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id", requireAuth, requirePermission('orders', 'update'), async (req, res) => {
    try {
      const previousOrder = await Order.findById(req.params.id).populate('customerId');
      const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate('customerId')
        .populate('items.productId')
        .populate('salespersonId');
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Notify about payment status changes
      if (req.body.paymentStatus && previousOrder && req.body.paymentStatus !== previousOrder.paymentStatus) {
        const customerName = order.customerId?.name || 'Unknown Customer';
        if (req.body.paymentStatus === 'due') {
          await notifyPaymentDue(order, customerName);
        }
      }
      
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: "Failed to update order" });
    }
  });

  app.delete("/api/orders/:id", requireAuth, requirePermission('orders', 'delete'), async (req, res) => {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete order" });
    }
  });

  // Inventory transactions with permission checks
  app.get("/api/inventory-transactions", requireAuth, requirePermission('inventory', 'read'), async (req, res) => {
    try {
      const transactions = await InventoryTransaction.find()
        .populate('productId')
        .populate('userId')
        .populate('supplierId')
        .populate('purchaseOrderId')
        .sort({ date: -1 });
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/inventory-transactions", requireAuth, requirePermission('inventory', 'create'), async (req, res) => {
    try {
      const product = await Product.findById(req.body.productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const previousStock = product.stockQty;
      let multiplier = 1;
      
      if (req.body.type === 'IN' || req.body.type === 'RETURN') {
        multiplier = 1;
      } else if (req.body.type === 'OUT') {
        multiplier = -1;
      } else if (req.body.type === 'ADJUSTMENT') {
        multiplier = 0; // For adjustments, quantity is absolute
      }
      
      const newStock = req.body.type === 'ADJUSTMENT' 
        ? req.body.quantity 
        : previousStock + (multiplier * req.body.quantity);
      
      const transactionData = {
        ...req.body,
        userId: (req as any).session.userId,
        previousStock,
        newStock,
      };
      
      const transaction = await InventoryTransaction.create(transactionData);
      
      const updatedProduct = await Product.findByIdAndUpdate(
        req.body.productId,
        { stockQty: newStock },
        { new: true }
      );
      
      // Check for low stock and create notification
      if (updatedProduct && (req.body.type === 'OUT' || req.body.type === 'ADJUSTMENT')) {
        await checkAndNotifyLowStock(updatedProduct);
      }
      
      await transaction.populate(['productId', 'userId', 'supplierId', 'purchaseOrderId']);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Failed to create transaction" });
    }
  });

  // Low stock alerts
  app.get("/api/products/low-stock", requireAuth, requirePermission('products', 'read'), async (req, res) => {
    try {
      const lowStockProducts = await Product.find({
        $expr: { $lte: ['$stockQty', '$minStockLevel'] }
      }).sort({ stockQty: 1 });
      res.json(lowStockProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch low stock products" });
    }
  });

  // Product search by barcode/QR
  app.get("/api/products/barcode/:barcode", requireAuth, requirePermission('products', 'read'), async (req, res) => {
    try {
      const product = await Product.findOne({ barcode: req.params.barcode });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Product returns with permission checks
  app.get("/api/product-returns", requireAuth, requirePermission('inventory', 'read'), async (req, res) => {
    try {
      const returns = await ProductReturn.find()
        .populate('productId')
        .populate('customerId')
        .populate('orderId')
        .populate('processedBy')
        .sort({ returnDate: -1 });
      res.json(returns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product returns" });
    }
  });

  app.post("/api/product-returns", requireAuth, requirePermission('inventory', 'create'), async (req, res) => {
    try {
      const returnData = {
        ...req.body,
        returnDate: new Date(),
      };
      const productReturn = await ProductReturn.create(returnData);
      await productReturn.populate(['productId', 'customerId', 'orderId']);
      res.json(productReturn);
    } catch (error) {
      res.status(400).json({ error: "Failed to create product return" });
    }
  });

  app.patch("/api/product-returns/:id", requireAuth, requirePermission('inventory', 'update'), async (req, res) => {
    try {
      const { status, refundAmount, restockable, notes } = req.body;
      const updateData: any = { status, refundAmount, restockable, notes };
      
      if (status === 'processed') {
        updateData.processedBy = (req as any).session.userId;
        updateData.processedDate = new Date();
        
        // If approved and restockable, create inventory transaction
        if (restockable) {
          const productReturn = await ProductReturn.findById(req.params.id);
          if (productReturn) {
            await InventoryTransaction.create({
              productId: productReturn.productId,
              type: 'RETURN',
              quantity: productReturn.quantity,
              reason: `Product return: ${productReturn.reason}`,
              userId: (req as any).session.userId,
              returnId: productReturn._id,
              date: new Date(),
            });
            
            await Product.findByIdAndUpdate(
              productReturn.productId,
              { $inc: { stockQty: productReturn.quantity } }
            );
          }
        }
      }
      
      const updatedReturn = await ProductReturn.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).populate(['productId', 'customerId', 'orderId', 'processedBy']);
      
      if (!updatedReturn) {
        return res.status(404).json({ error: "Product return not found" });
      }
      
      res.json(updatedReturn);
    } catch (error) {
      res.status(400).json({ error: "Failed to update product return" });
    }
  });

  // Notifications with permission checks
  app.get("/api/notifications", requireAuth, requirePermission('notifications', 'read'), async (req, res) => {
    try {
      const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, requirePermission('notifications', 'update'), async (req, res) => {
    try {
      const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { read: true },
        { new: true }
      );
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      res.status(400).json({ error: "Failed to update notification" });
    }
  });

  app.patch("/api/notifications/mark-all-read", requireAuth, requirePermission('notifications', 'update'), async (req, res) => {
    try {
      await Notification.updateMany({ read: false }, { read: true });
      res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      res.status(400).json({ error: "Failed to mark all notifications as read" });
    }
  });

  app.post("/api/notifications/create-test", requireAuth, requirePermission('notifications', 'create'), async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ error: "Test endpoint only available in development" });
    }
    
    try {
      const testNotifications = [
        {
          message: "Low stock alert: Brake Pads Set (12 units remaining)",
          type: "low_stock",
          read: false,
        },
        {
          message: "New order received from Rajesh Kumar - Order #ORD-2024-001",
          type: "new_order",
          read: false,
        },
        {
          message: "Payment overdue: Invoice #INV-2024-045 (5 days)",
          type: "payment_due",
          read: false,
        },
      ];
      
      const created = await Notification.insertMany(testNotifications);
      res.json({ success: true, count: created.length, notifications: created });
    } catch (error) {
      res.status(400).json({ error: "Failed to create test notifications" });
    }
  });

  app.post("/api/notifications/check-overdue-payments", requireAuth, requirePermission('notifications', 'create'), async (req, res) => {
    try {
      const overdueThresholdDays = 7; // Consider payments overdue after 7 days
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - overdueThresholdDays);
      
      // Find orders with payment status 'due' or 'partial' created before threshold date
      const overdueOrders = await Order.find({
        paymentStatus: { $in: ['due', 'partial'] },
        createdAt: { $lt: thresholdDate }
      }).populate('customerId');
      
      let notificationsCreated = 0;
      
      for (const order of overdueOrders) {
        const orderAge = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        const daysOverdue = Math.max(orderAge - overdueThresholdDays, 1);
        const customerName = order.customerId?.name || order.customerName || 'Unknown Customer';
        
        // Check if notification already exists for this order
        const existingNotification = await Notification.findOne({
          relatedId: order._id,
          type: 'payment_due',
          message: { $regex: 'overdue' }
        });
        
        if (!existingNotification) {
          await notifyPaymentOverdue(order, customerName, daysOverdue);
          notificationsCreated++;
        }
      }
      
      res.json({ 
        success: true, 
        checked: overdueOrders.length, 
        notificationsCreated,
        message: `Checked ${overdueOrders.length} overdue orders, created ${notificationsCreated} new notifications`
      });
    } catch (error) {
      res.status(400).json({ error: "Failed to check overdue payments" });
    }
  });

  // Dashboard stats - role-based analytics aligned with ROLE_PERMISSIONS
  app.get("/api/dashboard-stats", requireAuth, async (req, res) => {
    try {
      const userRole = (req as any).session.userRole;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const stats: any = {};
      const permissions: any = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || {};
      
      // Admin sees everything (has permissions for all resources)
      if (userRole === 'Admin') {
        const todayOrders = await Order.find({ createdAt: { $gte: today } });
        stats.todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
        stats.activeServices = await ServiceVisit.countDocuments({ 
          status: { $in: ['inquired', 'working', 'waiting'] } 
        });
        stats.totalCustomers = await Customer.countDocuments();
        stats.lowStockProducts = await Product.find({
          $expr: { $lte: ['$stockQty', '$minStockLevel'] }
        }).limit(5);
        stats.totalEmployees = await Employee.countDocuments();
        stats.totalProducts = await Product.countDocuments();
      }
      
      // Inventory Manager: only products and inventory (per ROLE_PERMISSIONS)
      else if (userRole === 'Inventory Manager') {
        if (permissions.products?.includes('read')) {
          stats.totalProducts = await Product.countDocuments();
          stats.lowStockProducts = await Product.find({
            $expr: { $lte: ['$stockQty', '$minStockLevel'] }
          }).limit(5);
          stats.totalInventoryValue = await Product.aggregate([
            { $group: { _id: null, total: { $sum: { $multiply: ['$stockQty', '$unitPrice'] } } } }
          ]).then(result => result[0]?.total || 0);
        }
        if (permissions.inventory?.includes('read')) {
          stats.recentTransactions = await InventoryTransaction.countDocuments({ 
            createdAt: { $gte: today } 
          });
        }
      }
      
      // Sales Executive: only customers and orders (per ROLE_PERMISSIONS)
      else if (userRole === 'Sales Executive') {
        if (permissions.orders?.includes('read')) {
          const todayOrders = await Order.find({ createdAt: { $gte: today } });
          stats.todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
          stats.activeOrders = await Order.countDocuments({ 
            status: { $in: ['pending', 'processing'] } 
          });
          stats.totalOrders = await Order.countDocuments();
        }
        if (permissions.customers?.includes('read')) {
          stats.totalCustomers = await Customer.countDocuments();
        }
      }
      
      // HR Manager: only employees and attendance (per ROLE_PERMISSIONS)
      else if (userRole === 'HR Manager') {
        if (permissions.employees?.includes('read')) {
          stats.totalEmployees = await Employee.countDocuments();
        }
        if (permissions.attendance?.includes('read')) {
          stats.presentToday = await Attendance.countDocuments({ 
            date: today, 
            status: 'present' 
          });
        }
        if (permissions.leaves?.includes('read')) {
          stats.pendingLeaves = await Leave.countDocuments({ status: 'pending' });
        }
        if (permissions.tasks?.includes('read')) {
          stats.activeTasks = await Task.countDocuments({ 
            status: { $in: ['assigned', 'in-progress'] } 
          });
        }
      }
      
      // Service Staff: customers (read only) and orders (read/update) per ROLE_PERMISSIONS
      else if (userRole === 'Service Staff') {
        if (permissions.customers?.includes('read')) {
          stats.totalCustomers = await Customer.countDocuments();
        }
        if (permissions.orders?.includes('read')) {
          const userId = (req as any).session.userId;
          // Only show their own service visits since they have limited access
          stats.myActiveOrders = await Order.countDocuments({ 
            handlerId: userId,
            status: { $in: ['pending', 'processing'] } 
          });
          stats.myCompletedToday = await Order.countDocuments({
            handlerId: userId,
            status: 'completed',
            updatedAt: { $gte: today }
          });
        }
      }
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Suppliers with permission checks
  app.get("/api/suppliers", requireAuth, requirePermission('suppliers', 'read'), async (req, res) => {
    try {
      const suppliers = await Supplier.find().sort({ createdAt: -1 });
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", requireAuth, requirePermission('suppliers', 'create'), async (req, res) => {
    try {
      const supplier = await Supplier.create(req.body);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ error: "Failed to create supplier" });
    }
  });

  app.patch("/api/suppliers/:id", requireAuth, requirePermission('suppliers', 'update'), async (req, res) => {
    try {
      const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ error: "Failed to update supplier" });
    }
  });

  app.delete("/api/suppliers/:id", requireAuth, requirePermission('suppliers', 'delete'), async (req, res) => {
    try {
      const supplier = await Supplier.findByIdAndDelete(req.params.id);
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete supplier" });
    }
  });

  // Purchase orders with permission checks
  app.get("/api/purchase-orders", requireAuth, requirePermission('purchaseOrders', 'read'), async (req, res) => {
    try {
      const orders = await PurchaseOrder.find()
        .populate('supplierId')
        .populate('createdBy')
        .sort({ createdAt: -1 });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
  });

  app.post("/api/purchase-orders", requireAuth, requirePermission('purchaseOrders', 'create'), async (req, res) => {
    try {
      const po = await PurchaseOrder.create(req.body);
      await po.populate('supplierId');
      res.json(po);
    } catch (error) {
      res.status(400).json({ error: "Failed to create purchase order" });
    }
  });

  app.patch("/api/purchase-orders/:id", requireAuth, requirePermission('purchaseOrders', 'update'), async (req, res) => {
    try {
      const po = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate('supplierId');
      if (!po) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      
      if (req.body.status === 'received') {
        for (const item of po.items) {
          if (item.productId) {
            await Product.findByIdAndUpdate(
              item.productId,
              { $inc: { stockQty: item.quantity } }
            );
            
            await InventoryTransaction.create({
              productId: item.productId,
              type: 'IN',
              quantity: item.quantity,
              reason: `Purchase Order ${po.poNumber}`,
            });
          }
        }
        po.actualDeliveryDate = new Date();
        await po.save();
      }
      
      res.json(po);
    } catch (error) {
      res.status(400).json({ error: "Failed to update purchase order" });
    }
  });

  // Attendance with permission checks
  app.get("/api/attendance", requireAuth, requirePermission('attendance', 'read'), async (req, res) => {
    try {
      const { employeeId, startDate, endDate } = req.query;
      const filter: any = {};
      
      if (employeeId) filter.employeeId = employeeId;
      if (startDate && endDate) {
        filter.date = { 
          $gte: new Date(startDate as string), 
          $lte: new Date(endDate as string) 
        };
      }
      
      const attendance = await Attendance.find(filter)
        .populate('employeeId')
        .sort({ date: -1 });
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance", requireAuth, requirePermission('attendance', 'create'), async (req, res) => {
    try {
      const attendance = await Attendance.create(req.body);
      await attendance.populate('employeeId');
      res.json(attendance);
    } catch (error) {
      res.status(400).json({ error: "Failed to create attendance record" });
    }
  });

  app.patch("/api/attendance/:id", requireAuth, requirePermission('attendance', 'update'), async (req, res) => {
    try {
      const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate('employeeId');
      if (!attendance) {
        return res.status(404).json({ error: "Attendance record not found" });
      }
      res.json(attendance);
    } catch (error) {
      res.status(400).json({ error: "Failed to update attendance" });
    }
  });

  // Leaves with permission checks
  app.get("/api/leaves", requireAuth, requirePermission('leaves', 'read'), async (req, res) => {
    try {
      const { employeeId, status } = req.query;
      const filter: any = {};
      
      if (employeeId) filter.employeeId = employeeId;
      if (status) filter.status = status;
      
      const leaves = await Leave.find(filter)
        .populate('employeeId')
        .populate('approvedBy')
        .sort({ createdAt: -1 });
      res.json(leaves);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaves" });
    }
  });

  app.post("/api/leaves", requireAuth, requirePermission('leaves', 'create'), async (req, res) => {
    try {
      const leave = await Leave.create(req.body);
      await leave.populate('employeeId');
      res.json(leave);
    } catch (error) {
      res.status(400).json({ error: "Failed to create leave request" });
    }
  });

  app.patch("/api/leaves/:id", requireAuth, requirePermission('leaves', 'update'), async (req, res) => {
    try {
      const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate('employeeId')
        .populate('approvedBy');
      if (!leave) {
        return res.status(404).json({ error: "Leave request not found" });
      }
      res.json(leave);
    } catch (error) {
      res.status(400).json({ error: "Failed to update leave request" });
    }
  });

  // Tasks with permission checks
  app.get("/api/tasks", requireAuth, requirePermission('tasks', 'read'), async (req, res) => {
    try {
      const { assignedTo, status } = req.query;
      const filter: any = {};
      
      if (assignedTo) filter.assignedTo = assignedTo;
      if (status) filter.status = status;
      
      const tasks = await Task.find(filter)
        .populate('assignedTo')
        .populate('assignedBy')
        .sort({ createdAt: -1 });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", requireAuth, requirePermission('tasks', 'create'), async (req, res) => {
    try {
      const task = await Task.create(req.body);
      await task.populate('assignedTo');
      await task.populate('assignedBy');
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", requireAuth, requirePermission('tasks', 'update'), async (req, res) => {
    try {
      const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate('assignedTo')
        .populate('assignedBy');
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Failed to update task" });
    }
  });

  // Communication logs with permission checks
  app.get("/api/communication-logs", requireAuth, requirePermission('communications', 'read'), async (req, res) => {
    try {
      const { customerId } = req.query;
      const filter: any = {};
      
      if (customerId) filter.customerId = customerId;
      
      const logs = await CommunicationLog.find(filter)
        .populate('customerId')
        .populate('handledBy')
        .sort({ date: -1 });
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch communication logs" });
    }
  });

  app.post("/api/communication-logs", requireAuth, requirePermission('communications', 'create'), async (req, res) => {
    try {
      const log = await CommunicationLog.create(req.body);
      await log.populate('customerId');
      await log.populate('handledBy');
      res.json(log);
    } catch (error) {
      res.status(400).json({ error: "Failed to create communication log" });
    }
  });

  // Feedbacks with permission checks
  app.get("/api/feedbacks", requireAuth, requirePermission('feedbacks', 'read'), async (req, res) => {
    try {
      const { customerId, type, status } = req.query;
      const filter: any = {};
      
      if (customerId) filter.customerId = customerId;
      if (type) filter.type = type;
      if (status) filter.status = status;
      
      const feedbacks = await Feedback.find(filter)
        .populate('customerId')
        .populate('assignedTo')
        .sort({ createdAt: -1 });
      res.json(feedbacks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedbacks" });
    }
  });

  app.post("/api/feedbacks", requireAuth, requirePermission('feedbacks', 'create'), async (req, res) => {
    try {
      const feedback = await Feedback.create(req.body);
      await feedback.populate('customerId');
      res.json(feedback);
    } catch (error) {
      res.status(400).json({ error: "Failed to create feedback" });
    }
  });

  app.patch("/api/feedbacks/:id", requireAuth, requirePermission('feedbacks', 'update'), async (req, res) => {
    try {
      const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate('customerId')
        .populate('assignedTo');
      if (!feedback) {
        return res.status(404).json({ error: "Feedback not found" });
      }
      res.json(feedback);
    } catch (error) {
      res.status(400).json({ error: "Failed to update feedback" });
    }
  });

  // Reports - Admin and HR Manager can access
  app.get("/api/reports/sales", requireAuth, requirePermission('reports', 'read'), async (req, res) => {
    try {
      const { startDate, endDate, period = 'daily' } = req.query;
      const matchStage: any = {};
      
      if (startDate && endDate) {
        matchStage.createdAt = { 
          $gte: new Date(startDate as string), 
          $lte: new Date(endDate as string) 
        };
      }
      
      const groupFormat = period === 'monthly' 
        ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
        : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
      
      const salesReport = await Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: groupFormat,
            totalSales: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$total' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
      ]);
      
      res.json(salesReport);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate sales report" });
    }
  });

  app.get("/api/reports/inventory", requireAuth, requirePermission('reports', 'read'), async (req, res) => {
    try {
      const lowStockProducts = await Product.find({
        $expr: { $lte: ['$stockQty', '$minStockLevel'] }
      }).sort({ stockQty: 1 });
      
      const outOfStockProducts = await Product.find({ stockQty: 0 });
      
      const totalInventoryValue = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalValue: { $sum: { $multiply: ['$stockQty', '$sellingPrice'] } },
            totalItems: { $sum: '$stockQty' }
          }
        }
      ]);
      
      res.json({
        lowStockProducts,
        outOfStockProducts,
        totalInventoryValue: totalInventoryValue[0] || { totalValue: 0, totalItems: 0 }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate inventory report" });
    }
  });

  app.get("/api/reports/top-products", requireAuth, requirePermission('reports', 'read'), async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      
      const topProducts = await Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: parseInt(limit as string) },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' }
      ]);
      
      res.json(topProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate top products report" });
    }
  });

  app.get("/api/reports/employee-performance", requireAuth, requirePermission('reports', 'read'), async (req, res) => {
    try {
      const employeeSales = await Order.aggregate([
        { $match: { salespersonId: { $exists: true } } },
        {
          $group: {
            _id: '$salespersonId',
            totalSales: { $sum: '$total' },
            orderCount: { $sum: 1 },
            avgOrderValue: { $avg: '$total' }
          }
        },
        {
          $lookup: {
            from: 'employees',
            localField: '_id',
            foreignField: '_id',
            as: 'employee'
          }
        },
        { $unwind: '$employee' },
        { $sort: { totalSales: -1 } }
      ]);
      
      res.json(employeeSales);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate employee performance report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
