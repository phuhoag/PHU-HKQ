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

const generateFallbackResponse = async (messageText) => {
  try {
    const text = messageText.toLowerCase().trim();

    // 1. Chào hỏi
    if (
      text.includes("chào") ||
      text.includes("hello") ||
      text.includes("hi") ||
      text.includes("hey") ||
      text === "alo" ||
      text === "test"
    ) {
      return "Xin chào! Em là trợ lý ảo TechStore. Em có thể giúp gì cho anh/chị hôm nay ạ?\n\nAnh/chị có thể hỏi em về:\n• 🔍 Tìm kiếm sản phẩm (ví dụ: 'tìm laptop', 'bàn phím', 'màn hình')\n• 🎁 Mã khuyến mãi mới nhất\n• 📦 Tra cứu tình trạng đơn hàng";
    }

    // 2. Khuyến mãi / mã giảm giá
    if (
      text.includes("khuyến mãi") ||
      text.includes("giảm giá") ||
      text.includes("coupon") ||
      text.includes("voucher") ||
      text.includes("ưu đãi")
    ) {
      const promos = await getLatestPromotions();
      if (Array.isArray(promos) && promos.length > 0) {
        const promoList = promos
          .map(
            (p) =>
              `• Mã **${p.code}**: Giảm ${
                p.discount_type === "percentage"
                  ? `${p.discount_value}%`
                  : `${(Number(p.discount_value) * 25000).toLocaleString("vi-VN")} đ`
              } (Đơn tối thiểu ${(Number(p.min_purchase) * 25000).toLocaleString("vi-VN")} đ)`
          )
          .join("\n");
        return `Hiện tại TechStore đang có các chương trình khuyến mãi hấp dẫn:\n\n${promoList}\n\nAnh/chị hãy nhập mã tại bước thanh toán để nhận ưu đãi nhé!`;
      }
      return "Hiện tại chưa có mã giảm giá mới. Anh/chị hãy theo dõi thêm tại trang chủ TechStore nhé!";
    }

    // 3. Tra cứu đơn hàng
    if (text.includes("đơn hàng") || text.includes("order") || text.includes("tra cứu")) {
      const phoneOrEmailMatch = messageText.match(
        /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+|\b0[0-9]{9}\b)/
      );
      if (phoneOrEmailMatch) {
        const orders = await getUserOrders({ emailOrPhone: phoneOrEmailMatch[0] });
        if (Array.isArray(orders) && orders.length > 0) {
          const orderList = orders
            .map(
              (o) =>
                `• Đơn hàng **#${o.orderId.slice(-6)}**: Tổng tiền ${(
                  Number(o.total_amount) * 25000
                ).toLocaleString("vi-VN")} đ | Trạng thái: **${o.status}**`
            )
            .join("\n");
          return `Thông tin đơn hàng của anh/chị:\n\n${orderList}`;
        }
        return `Không tìm thấy đơn hàng nào liên kết với thông tin "${phoneOrEmailMatch[0]}". Vui lòng kiểm tra lại số điện thoại hoặc email.`;
      }
      return "Để tra cứu đơn hàng, anh/chị vui lòng nhập câu hỏi kèm theo Số điện thoại hoặc Email đặt hàng nhé! (Ví dụ: 'Tra cứu đơn hàng 0987654321')";
    }

    // 4. Tìm kiếm sản phẩm
    const cleanQuery = messageText.replace(/tìm|sản phẩm|có bán|mua|giá|cho tôi|hỏi về/gi, "").trim() || messageText;
    const searchResult = await searchProducts({ query: cleanQuery });
    if (Array.isArray(searchResult) && searchResult.length > 0) {
      const list = searchResult
        .map(
          (p) =>
            `• **${p.name}** (${p.category}): ${(Number(p.price) * 25000).toLocaleString("vi-VN")} đ - Còn ${p.stock} sản phẩm`
        )
        .join("\n");
      return `Dưới đây là một số sản phẩm phù hợp tại TechStore:\n\n${list}\n\nAnh/chị có thể vào mục Cửa hàng (Shop) để xem chi tiết và đặt mua nhé!`;
    }

    return "Cảm ơn anh/chị đã nhắn tin! Anh/chị có thể hỏi em về các sản phẩm công nghệ (Laptop, Màn hình, Bàn phím, Chuột...), mã khuyến mãi hoặc tra cứu tình trạng đơn hàng nhé.";
  } catch (fallbackErr) {
    console.error("Fallback response error:", fallbackErr);
    return "Xin chào! Em có thể giúp gì cho anh/chị về sản phẩm hoặc đơn hàng tại TechStore?";
  }
};

export const handleChatbotMessage = async (messageText, userInfo = null) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not found, using intelligent fallback responder.");
    return await generateFallbackResponse(messageText);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
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
  } catch (error) {
    console.error("Gemini AI API error, falling back to local smart responder:", error.message);
    return await generateFallbackResponse(messageText);
  }
};
