// Von Claude für Effizienz und Konsistenz
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type BooksStackParamList = {
  BooksList: undefined;
  BookForm: { bookId?: number } | undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Books: undefined; // nested stack — no params needed at the tab level itself
  Profile: undefined;
};