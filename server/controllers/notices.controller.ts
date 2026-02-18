// export const createNotice = async (req: Request, res: Response) => {
//   const userId = req.user.id;
//   const result = await noticeService.createNotice(userId, req.body);

//   if (result.error) {
//     return res.status(400).json(result.error);
//   }
//   if (result.serverError) {
//     return res.status(500).json(result.serverError);
//   }

//   return res.status(201).json(result.success);
// };

// export const getMyNotices = async (req: Request, res: Response) => {
//   const userId = req.user.id;
//   const { type, priority, page, limit } = req.query;

//   const result = await noticeService.getNoticesForUser(userId, {
//     type: type as string,
//     priority: priority as string,
//     page: page ? parseInt(page as string) : undefined,
//     limit: limit ? parseInt(limit as string) : undefined,
//   });

//   if (result.error) {
//     return res.status(400).json(result.error);
//   }
//   if (result.serverError) {
//     return res.status(500).json(result.serverError);
//   }

//   return res.status(200).json(result.success);
// };

// export const getNoticeById = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const userId = req.user.id;

//   const result = await noticeService.getNoticeById(id, userId);

//   if (result.error) {
//     return res.status(404).json(result.error);
//   }
//   if (result.serverError) {
//     return res.status(500).json(result.serverError);
//   }

//   return res.status(200).json(result.success);
// };

// export const updateNotice = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const userId = req.user.id;

//   const result = await noticeService.updateNotice(id, userId, req.body);

//   if (result.error) {
//     return res.status(400).json(result.error);
//   }
//   if (result.serverError) {
//     return res.status(500).json(result.serverError);
//   }

//   return res.status(200).json(result.success);
// };

// export const deleteNotice = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const userId = req.user.id;

//   const result = await noticeService.deleteNotice(id, userId);

//   if (result.error) {
//     return res.status(400).json(result.error);
//   }
//   if (result.serverError) {
//     return res.status(500).json(result.serverError);
//   }

//   return res.status(200).json(result.success);
// };

// export const togglePin = async (req: Request, res: Response) => {
//   const { id } = req.params;

//   const result = await noticeService.togglePinNotice(id);

//   if (result.error) {
//     return res.status(400).json(result.error);
//   }
//   if (result.serverError) {
//     return res.status(500).json(result.serverError);
//   }

//   return res.status(200).json(result.success);
// };

// export const archiveNotice = async (req: Request, res: Response) => {
//   const { id } = req.params;

//   const result = await noticeService.archiveNotice(id);

//   if (result.error) {
//     return res.status(400).json(result.error);
//   }
//   if (result.serverError) {
//     return res.status(500).json(result.serverError);
//   }

//   return res.status(200).json(result.success);
// };
