import { GoogleGenerativeAI } from "@google/generative-ai";
import { Product, Order, Coupon, User } from "../models/index.js";


const searchProducts = async ({ query }) => {
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .populate("category_id")
      .limit(5);

    return products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      category: p.category_id?.name || "N/A",
      price: p.price?.$numberDecimal || p.price || 0,
      stock: p.stock,
      description: p.description || "",
    }));
  } catch (err) {
    return { error: err.message };
  }
};

const getProductDetails = async ({ productId }) => {
  try {
    const p = await Product.findById(productId).populate("category_id");
    if (!p) return { error: "Không tìm thấy sản phẩm" };
    return {
      id: p._id.toString(),
      name: p.name,
      category: p.category_id?.name || "N/A",
      price: p.price?.$numberDecimal || p.price || 0,
      stock: p.stock,
      description: p.description || "",
      image: p.image || "",
    };
  } catch (err) {
    return { error: err.message };
  }
};

const getLatestPromotions = async () => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      is_active: true,
      expiry_date: { $gte: now },
    }).limit(5);

    return coupons.map((c) => ({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_purchase: c.min_purchase,
      expiry_date: c.expiry_date,
    }));
  } catch (err) {
    return { error: err.message };
  }
};

const getUserOrders = async ({ emailOrPhone }) => {
  try {
    const user = await User.findOne({
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone },
      ],
    });

    const query = { $or: [{ phone: emailOrPhone }] };
    if (user) {
      query.$or.push({ user_id: user._id });
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(3);

    return orders.map((o) => ({
      orderId: o._id.toString(),
      total_amount: o.total_amount?.$numberDecimal || o.total_amount || 0,
      status: o.status,
      payment_method: o.payment_method,
      payment_status: o.payment_status,
      shipping_address: o.shipping_address,
      createdAt: o.createdAt,
    }));
  } catch (err) {
    return { error: err.message };
  }
};

const functions = {
  searchProducts,
  getProductDetails,
  getLatestPromotions,
  getUserOrders,
};

export const handleChatbotMessage = async (messageText, userInfo = null) => {
  if (!process.env.GEMINI_API_KEY) {
    return "Xin lỗi, khóa cấu hình Gemini API chưa được cài đặt. Vui lòng thiết lập biến môi trường GEMINI_API_KEY.";
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash", // gemini-3.5-flash supports tool calling perfectly
    systemInstruction: `Bạn là trợ lý ảo hỗ trợ khách hàng của TechStore (cửa hàng đồ công nghệ cao cấp).
Hãy nói tiếng Việt thân thiện, chuyên nghiệp, lịch sự và ngắn gọn.
Bạn có thể tra cứu thông tin sản phẩm, đơn hàng của khách hàng, và các khuyến mãi hiện có bằng các công cụ (tools) được cung cấp.
Khi hiển thị giá tiền, hãy quy đổi sang VND (tỷ lệ 1 USD = 25.000 VND) và định dạng ngăn cách hàng nghìn (ví dụ: 2.490.000 đ hoặc 2.490.000 VND).
Nếu tìm thấy sản phẩm, hãy liệt kê tên, danh mục và giá bán. Đưa ra gợi ý liên quan nếu cần.
Nếu không tìm thấy thông tin phù hợp trong cơ sở dữ liệu sau khi tra cứu, hãy phản hồi trung thực và lịch sự.`,
  });

  const chat = model.startChat({
    tools: [
      {
        functionDeclarations: [
          {
            name: "searchProducts",
            description: "Tìm kiếm sản phẩm trong cửa hàng theo từ khóa hoặc tên danh mục.",
            parameters: {
              type: "OBJECT",
              properties: {
                query: { type: "STRING", description: "Từ khóa hoặc tên sản phẩm cần tìm." },
              },
              required: ["query"],
            },
          },
          {
            name: "getProductDetails",
            description: "Xem chi tiết một sản phẩm cụ thể bằng mã ID.",
            parameters: {
              type: "OBJECT",
              properties: {
                productId: { type: "STRING", description: "Mã ID của sản phẩm." },
              },
              required: ["productId"],
            },
          },
          {
            name: "getLatestPromotions",
            description: "Lấy các mã giảm giá và khuyến mãi đang hoạt động trong cửa hàng.",
            parameters: {
              type: "OBJECT",
              properties: {},
            },
          },
          {
            name: "getUserOrders",
            description: "Tra cứu danh sách đơn hàng hoặc tình trạng đơn hàng mới nhất của khách hàng theo số điện thoại hoặc email.",
            parameters: {
              type: "OBJECT",
              properties: {
                emailOrPhone: { type: "STRING", description: "Số điện thoại hoặc email liên kết với đơn hàng." },
              },
              required: ["emailOrPhone"],
            },
          },
        ],
      },
    ],
  });

  let response = await chat.sendMessage(messageText);
  let functionCalls = response.response.functionCalls ? response.response.functionCalls() : null;

  // Loop if Gemini makes recursive tool calls
  while (functionCalls && functionCalls.length > 0) {
    const functionResponses = [];
    for (const call of functionCalls) {
      const { name, args } = call;
      console.log(`🤖 Chatbot Gemini invoking function: ${name} with args:`, args);
      let result = null;
      try {
        if (functions[name]) {
          result = await functions[name](args);
        } else {
          result = { error: `Function ${name} not found` };
        }
      } catch (err) {
        console.error(`Error executing ${name}:`, err);
        result = { error: err.message };
      }
      functionResponses.push({
        functionResponse: {
          name,
          response: { content: result },
        },
      });
    }

    response = await chat.sendMessage(functionResponses);
    functionCalls = response.response.functionCalls ? response.response.functionCalls() : null;
  }

  return response.response.text();
};
