export default function Catch(onRejection) {
  return this.then(undefined, onRejection);
}
