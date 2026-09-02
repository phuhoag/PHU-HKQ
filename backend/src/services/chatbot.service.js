import { GoogleGenerativeAI } from "@google/generative-ai";
import { Product, Order, Coupon, User } from "../models/index.js";


const searchProducts = async ({ query }) => {
  try {
    const qLower = (query || "").toLowerCase();
    const keywords = [];

    if (
      qLower.includes("laptop") ||
      qLower.includes("máy tính") ||
      qLower.includes("macbook") ||
      qLower.includes("notebook") ||
      qLower.includes("dell")
    ) {
      keywords.push("laptop", "dell", "probook", "zenbook", "ultraslim");
    }
    if (
      qLower.includes("bàn phím") ||
      qLower.includes("keyboard") ||
      qLower.includes("phím")
    ) {
      keywords.push("keyboard", "silent pro", "phím");
    }
    if (
      qLower.includes("màn hình") ||
      qLower.includes("monitor") ||
      qLower.includes("màn") ||
      qLower.includes("display")
    ) {
      keywords.push("monitor", "display", "curved", "4k");
    }
    if (qLower.includes("chuột") || qLower.includes("mouse")) {
      keywords.push("mouse", "chuột", "office comfort");
    }
    if (
      qLower.includes("tai nghe") ||
      qLower.includes("headphone") ||
      qLower.includes("audio")
    ) {
      keywords.push("headphone", "studio", "tai nghe");
    }
    if (
      qLower.includes("ổ cứng") ||
      qLower.includes("ssd") ||
      qLower.includes("hdd") ||
      qLower.includes("storage") ||
      qLower.includes("lưu trữ") ||
      qLower.includes("nvme")
    ) {
      keywords.push("ssd", "hdd", "nvme", "prodrive", "turbo");
    }

    let products = [];
    if (keywords.length > 0) {
      products = await Product.find({
        $or: [
          { name: { $regex: keywords.join("|"), $options: "i" } },
          { description: { $regex: keywords.join("|"), $options: "i" } },
        ],
      })
        .populate("category_id")
        .limit(6);
    } else {
      const cleanQ = query.replace(/tư vấn|giúp tôi|khoảng giá|trong cửa hàng|tìm|sản phẩm|có bán|mua|giá|cho tôi|hỏi về/gi, "").trim();
      products = await Product.find({
        $or: [
          { name: { $regex: cleanQ || query, $options: "i" } },
          { description: { $regex: cleanQ || query, $options: "i" } },
        ],
      })
        .populate("category_id")
        .limit(6);
    }

    if (products.length === 0) {
      products = await Product.find({})
        .populate("category_id")
        .limit(4);
    }

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

    // 1. Chào hỏi thuần túy
    if (
      (text.includes("chào") ||
      text.includes("hello") ||
      text.includes("hi") ||
      text.includes("hey") ||
      text === "alo" ||
      text === "test") &&
      !text.includes("laptop") &&
      !text.includes("màn hình") &&
      !text.includes("phím") &&
      !text.includes("chuột") &&
      !text.includes("tai nghe") &&
      !text.includes("giá")
    ) {
      return "Xin chào! Em là trợ lý ảo TechStore. Em có thể giúp gì cho anh/chị hôm nay ạ?\n\nAnh/chị có thể hỏi em về:\n• 🔍 Tư vấn & tìm kiếm sản phẩm (ví dụ: 'tư vấn laptop khoảng 20tr', 'tìm bàn phím', 'màn hình 4k')\n• 🎁 Mã khuyến mãi & voucher mới nhất\n• 📦 Tra cứu tình trạng đơn hàng";
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

    // 4. Tư vấn & Tìm kiếm sản phẩm thông minh
    const searchResult = await searchProducts({ query: messageText });
    if (Array.isArray(searchResult) && searchResult.length > 0) {
      const list = searchResult
        .map(
          (p, i) =>
            `${i + 1}. **${p.name}**\n   - **Danh mục:** ${p.category}\n   - **Giá bán:** ${(Number(p.price) * 25000).toLocaleString("vi-VN")} đ\n   - **Tình trạng:** Còn ${p.stock} sản phẩm trong kho`
        )
        .join("\n\n");
      return `Dạ chào anh/chị! Dưới đây là các sản phẩm phù hợp đang có sẵn tại TechStore để anh/chị tham khảo ạ:\n\n${list}\n\nAnh/chị có thể truy cập mục **Cửa hàng (Shop)** để xem hình ảnh và bấm đặt mua nhé!`;
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
