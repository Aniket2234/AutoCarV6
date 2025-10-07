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

export async function registerRoutes(app: Express): Promise<Server> {
  await connectDB();

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

  const httpServer = createServer(app);
  return httpServer;
}
