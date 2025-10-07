import type { Express } from "express";
import { createServer, type Server } from "http";
import { connectDB } from "./db";
import { Product } from "./models/Product";
import { Customer } from "./models/Customer";
import { Employee } from "./models/Employee";
import { ServiceVisit } from "./models/ServiceVisit";
import { Order } from "./models/Order";
import { InventoryTransaction } from "./models/InventoryTransaction";
import { Notification } from "./models/Notification";
import { Supplier } from "./models/Supplier";
import { PurchaseOrder } from "./models/PurchaseOrder";
import { Attendance } from "./models/Attendance";
import { Leave } from "./models/Leave";
import { Task } from "./models/Task";
import { CommunicationLog } from "./models/CommunicationLog";
import { Feedback } from "./models/Feedback";
import { User } from "./models/User";
import { authenticateUser, createUser, ROLE_PERMISSIONS } from "./auth";
import { requireAuth, requireRole, attachUser } from "./middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  await connectDB();
  
  app.use(attachUser);

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      
      const user = await createUser(email, password, name, role || 'Service Staff');
      
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
      res.status(400).json({ error: "Failed to create user" });
    }
  });

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
      const { role, isActive } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role, isActive },
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

  app.get("/api/products", async (req, res) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = await Product.create(req.body);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
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

  app.delete("/api/products/:id", async (req, res) => {
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

  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await Customer.find().sort({ createdAt: -1 });
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customer = await Customer.create(req.body);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: "Failed to create customer" });
    }
  });

  app.patch("/api/customers/:id", async (req, res) => {
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

  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await Employee.find().sort({ createdAt: -1 });
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const employee = await Employee.create(req.body);
      res.json(employee);
    } catch (error) {
      res.status(400).json({ error: "Failed to create employee" });
    }
  });

  app.patch("/api/employees/:id", async (req, res) => {
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

  app.get("/api/service-visits", async (req, res) => {
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

  app.post("/api/service-visits", async (req, res) => {
    try {
      const visit = await ServiceVisit.create(req.body);
      await visit.populate('customerId');
      await visit.populate('handlerId');
      res.json(visit);
    } catch (error) {
      res.status(400).json({ error: "Failed to create service visit" });
    }
  });

  app.patch("/api/service-visits/:id", async (req, res) => {
    try {
      const visit = await ServiceVisit.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate('customerId')
        .populate('handlerId');
      if (!visit) {
        return res.status(404).json({ error: "Service visit not found" });
      }
      res.json(visit);
    } catch (error) {
      res.status(400).json({ error: "Failed to update service visit" });
    }
  });

  app.get("/api/orders", async (req, res) => {
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

  app.post("/api/orders", async (req, res) => {
    try {
      const order = await Order.create(req.body);
      
      for (const item of req.body.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockQty: -item.quantity } }
        );
        
        await InventoryTransaction.create({
          productId: item.productId,
          type: 'OUT',
          quantity: item.quantity,
          reason: `Order ${order.invoiceNumber}`,
        });
      }
      
      await order.populate('customerId');
      await order.populate('items.productId');
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate('customerId')
        .populate('items.productId')
        .populate('salespersonId');
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: "Failed to update order" });
    }
  });

  app.get("/api/inventory-transactions", async (req, res) => {
    try {
      const transactions = await InventoryTransaction.find()
        .populate('productId')
        .populate('userId')
        .sort({ date: -1 });
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/inventory-transactions", async (req, res) => {
    try {
      const transaction = await InventoryTransaction.create(req.body);
      
      const multiplier = req.body.type === 'IN' ? 1 : -1;
      await Product.findByIdAndUpdate(
        req.body.productId,
        { $inc: { stockQty: multiplier * req.body.quantity } }
      );
      
      await transaction.populate('productId');
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Failed to create transaction" });
    }
  });

  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
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

  app.get("/api/dashboard-stats", async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayOrders = await Order.find({ createdAt: { $gte: today } });
      const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
      
      const activeServices = await ServiceVisit.countDocuments({ 
        status: { $in: ['inquired', 'working', 'waiting'] } 
      });
      
      const totalCustomers = await Customer.countDocuments();
      
      const lowStockProducts = await Product.find({
        $expr: { $lte: ['$stockQty', '$minStockLevel'] }
      }).limit(5);
      
      res.json({
        todaySales,
        activeServices,
        totalCustomers,
        lowStockProducts
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await Supplier.find().sort({ createdAt: -1 });
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const supplier = await Supplier.create(req.body);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ error: "Failed to create supplier" });
    }
  });

  app.patch("/api/suppliers/:id", async (req, res) => {
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

  app.delete("/api/suppliers/:id", async (req, res) => {
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

  app.get("/api/purchase-orders", async (req, res) => {
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

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      const po = await PurchaseOrder.create(req.body);
      await po.populate('supplierId');
      res.json(po);
    } catch (error) {
      res.status(400).json({ error: "Failed to create purchase order" });
    }
  });

  app.patch("/api/purchase-orders/:id", async (req, res) => {
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

  app.get("/api/attendance", async (req, res) => {
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

  app.post("/api/attendance", async (req, res) => {
    try {
      const attendance = await Attendance.create(req.body);
      await attendance.populate('employeeId');
      res.json(attendance);
    } catch (error) {
      res.status(400).json({ error: "Failed to create attendance record" });
    }
  });

  app.patch("/api/attendance/:id", async (req, res) => {
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

  app.get("/api/leaves", async (req, res) => {
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

  app.post("/api/leaves", async (req, res) => {
    try {
      const leave = await Leave.create(req.body);
      await leave.populate('employeeId');
      res.json(leave);
    } catch (error) {
      res.status(400).json({ error: "Failed to create leave request" });
    }
  });

  app.patch("/api/leaves/:id", async (req, res) => {
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

  app.get("/api/tasks", async (req, res) => {
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

  app.post("/api/tasks", async (req, res) => {
    try {
      const task = await Task.create(req.body);
      await task.populate('assignedTo');
      await task.populate('assignedBy');
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
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

  app.get("/api/communication-logs", async (req, res) => {
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

  app.post("/api/communication-logs", async (req, res) => {
    try {
      const log = await CommunicationLog.create(req.body);
      await log.populate('customerId');
      await log.populate('handledBy');
      res.json(log);
    } catch (error) {
      res.status(400).json({ error: "Failed to create communication log" });
    }
  });

  app.get("/api/feedbacks", async (req, res) => {
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

  app.post("/api/feedbacks", async (req, res) => {
    try {
      const feedback = await Feedback.create(req.body);
      await feedback.populate('customerId');
      res.json(feedback);
    } catch (error) {
      res.status(400).json({ error: "Failed to create feedback" });
    }
  });

  app.patch("/api/feedbacks/:id", async (req, res) => {
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

  app.get("/api/reports/sales", async (req, res) => {
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

  app.get("/api/reports/inventory", async (req, res) => {
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

  app.get("/api/reports/top-products", async (req, res) => {
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

  app.get("/api/reports/employee-performance", async (req, res) => {
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
