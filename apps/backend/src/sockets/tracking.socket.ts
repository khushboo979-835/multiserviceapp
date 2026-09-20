import { Server, Socket } from "socket.io";
import { User } from "../models/User";
import { Booking } from "../models/Booking";

export const initTrackingSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Join tracking room for a specific booking
    socket.on("booking:join-room", async (data: { bookingId: string }) => {
      const { bookingId } = data;
      if (!bookingId) return;

      const roomName = `booking_${bookingId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);
    });

    // Handle provider updating their coordinates in real time
    socket.on(
      "provider:update-location",
      async (data: {
        providerId: string;
        bookingId?: string;
        location: {
          latitude: number;
          longitude: number;
          heading?: number;
          timestamp: number;
        };
      }) => {
        const { providerId, bookingId, location } = data;
        if (!providerId || !location) return;

        try {
          // Update provider location in database
          await User.findByIdAndUpdate(providerId, {
            location: {
              type: "Point",
              coordinates: [location.longitude, location.latitude],
              heading: location.heading,
              timestamp: location.timestamp,
            },
          });

          // If provider is active on a booking, broadcast updates to the room
          if (bookingId) {
            const roomName = `booking_${bookingId}`;
            io.to(roomName).emit("provider:location-changed", {
              providerId,
              location,
            });
            console.log(`Location update broadcasted to room ${roomName} for provider ${providerId}`);
          }
        } catch (error) {
          console.error("Failed to update provider location via socket:", error);
        }
      }
    );

    // Handle status change events (updates database and broadcasts timeline changes)
    socket.on(
      "booking:status-changed",
      async (data: {
        bookingId: string;
        status: string;
        note?: string;
      }) => {
        const { bookingId, status, note } = data;
        if (!bookingId || !status) return;

        try {
          const timelineEvent = {
            status,
            timestamp: new Date(),
            note: note || `Booking status updated to ${status}`,
          };

          const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            {
              status,
              $push: { timeline: timelineEvent },
            },
            { new: true }
          );

          if (updatedBooking) {
            const roomName = `booking_${bookingId}`;
            io.to(roomName).emit("booking:status-changed", {
              bookingId,
              status,
              timeline: updatedBooking.timeline,
            });
            console.log(`Booking ${bookingId} status changed to ${status} and broadcasted`);
          }
        } catch (error) {
          console.error("Failed to change booking status via socket:", error);
        }
      }
    );

    // Handle chat messaging between customer and provider in the room
    socket.on(
      "chat:send-message",
      (data: {
        bookingId: string;
        senderId: string;
        text: string;
        timestamp: string;
      }) => {
        const { bookingId, senderId, text, timestamp } = data;
        if (!bookingId || !senderId || !text) return;

        const roomName = `booking_${bookingId}`;
        io.to(roomName).emit("chat:message-received", {
          bookingId,
          senderId,
          text,
          timestamp: timestamp || new Date().toISOString(),
        });
        console.log(`Chat message from ${senderId} sent to room ${roomName}`);
      }
    );

    socket.on("disconnect", () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });
};
