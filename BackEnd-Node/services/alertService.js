import Alert from "../models/Alert.js";
import Budget from "../models/Budget.js";
import Subscription from "../models/Subscription.js";

/**
 * Calculate total monthly spending for a workspace
 * This matches the frontend calculation: sum of all subscription amounts
 */
const calculateMonthlySpending = async (workspaceId) => {
  try {
    // Get all subscriptions for the workspace
    const subscriptions = await Subscription.find({ workspaceId });
    
    // Calculate total from subscription amounts (matches frontend logic)
    // Frontend uses: subscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0)
    const total = subscriptions.reduce((sum, sub) => {
      return sum + (sub.amount || 0);
    }, 0);

    return total;
  } catch (error) {
    console.error("Error calculating monthly spending:", error);
    return 0;
  }
};

/**
 * Check if budget is exceeded and create alert if needed
 */
const checkBudgetAlerts = async () => {
  try {
    console.log("Checking budget alerts...");
    
    // Get all budgets
    const budgets = await Budget.find();
    
    for (const budget of budgets) {
      const monthlySpending = await calculateMonthlySpending(budget.workspaceId);
      
      // Get all subscriptions for this workspace
      const subscriptions = await Subscription.find({ workspaceId: budget.workspaceId });
      
      if (subscriptions.length === 0) {
        // Skip if no subscriptions exist (can't create alert without subscription reference)
        continue;
      }

      // Use first subscription as reference for workspace-level budget alerts
      const referenceSubscription = subscriptions[0];
      
      // Create date for today (start of day) for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Check if budget is exceeded
      if (monthlySpending > budget.monthlyCap) {
        // Check if budget exceeded alert already exists for today
        const existingAlert = await Alert.findOne({
          subscriptionId: referenceSubscription._id,
          type: "budget",
          dueDate: {
            $gte: today,
            $lt: tomorrow
          }
        });

        if (!existingAlert) {
          // Create budget exceeded alert
          await Alert.create({
            subscriptionId: referenceSubscription._id,
            type: "budget",
            dueDate: new Date(), // Set to current time
            sentAt: null
          });
          
          console.log(`✅ Budget EXCEEDED alert created for workspace ${budget.workspaceId}. Spending: ${monthlySpending}, Cap: ${budget.monthlyCap}`);
        }
      }
      // Check if budget threshold is reached (but not exceeded)
      else {
        const budgetUsage = (monthlySpending / budget.monthlyCap) * 100;
        if (budgetUsage >= budget.alertThreshold) {
          // Check if threshold alert already exists for today
          const existingAlert = await Alert.findOne({
            subscriptionId: referenceSubscription._id,
            type: "budget",
            dueDate: {
              $gte: today,
              $lt: tomorrow
            }
          });

          if (!existingAlert) {
            await Alert.create({
              subscriptionId: referenceSubscription._id,
              type: "budget",
              dueDate: new Date(),
              sentAt: null
            });
            
            console.log(`✅ Budget threshold alert created for workspace ${budget.workspaceId}. Usage: ${budgetUsage.toFixed(2)}%`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking budget alerts:", error);
  }
};

/**
 * Check for upcoming renewal deadlines and create alerts at specific intervals
 * Creates alerts at: 7 days, 5 days, 4 days, 3 days, 2 days, and 1 day before renewal
 */
const checkDeadlineAlerts = async () => {
  try {
    console.log("Checking deadline alerts...");
    
    // Get all subscriptions with renewal dates
    const subscriptions = await Subscription.find({
      nextRenewalDate: { $exists: true, $ne: null }
    });
    
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    // Alert intervals: 7, 5, 4, 3, 2, 1 days before renewal
    const alertIntervals = [7, 5, 4, 3, 2, 1];
    
    for (const subscription of subscriptions) {
      if (!subscription.nextRenewalDate) {
        continue;
      }
      
      const renewalDate = new Date(subscription.nextRenewalDate);
      renewalDate.setHours(0, 0, 0, 0);
      
      // Only check subscriptions with future renewal dates
      if (renewalDate <= today) {
        continue;
      }
      
      // Calculate days until renewal (using floor to get exact days)
      const timeDiff = renewalDate.getTime() - today.getTime();
      const daysUntil = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      console.log(`Checking subscription ${subscription.name}: renewal in ${daysUntil} days (${renewalDate.toISOString()})`);
      
      // Check if we should create an alert for this interval
      if (alertIntervals.includes(daysUntil) && daysUntil <= 7 && daysUntil > 0) {
        // Create date range for checking existing alerts (same day)
        const startOfDay = new Date(renewalDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(renewalDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        // Check if alert already exists for this subscription and renewal date
        const existingAlert = await Alert.findOne({
          subscriptionId: subscription._id,
          type: "renewal",
          dueDate: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        });

        if (!existingAlert) {
          // Create renewal alert with the renewal date as dueDate
          await Alert.create({
            subscriptionId: subscription._id,
            type: "renewal",
            dueDate: renewalDate,
            sentAt: null
          });
          
          console.log(`✅ Renewal alert created for subscription ${subscription.name}. Renewal in ${daysUntil} day${daysUntil > 1 ? 's' : ''} (${renewalDate.toISOString()})`);
        } else {
          console.log(`⏭️  Alert already exists for subscription ${subscription.name} (${daysUntil} days)`);
        }
      }
    }
  } catch (error) {
    console.error("Error checking deadline alerts:", error);
  }
};

/**
 * Main function to run all alert checks
 */
const runAlertChecks = async () => {
  try {
    console.log("Running automatic alert checks...");
    await checkBudgetAlerts();
    await checkDeadlineAlerts();
    console.log("Alert checks completed.");
  } catch (error) {
    console.error("Error running alert checks:", error);
  }
};

export default {
  runAlertChecks,
  checkBudgetAlerts,
  checkDeadlineAlerts,
  calculateMonthlySpending
};

