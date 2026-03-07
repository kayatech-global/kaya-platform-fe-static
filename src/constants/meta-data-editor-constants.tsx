export const META_DATA_EDITOR_PLACEHOLDER_TEXT = `{
  "language": {
    "name": "python",
    "version": {"$gt": @Variable.python_version}
  }
}`;
// $eq: Equal to (same as direct value comparison)
//
// $ne: Not equal to
//
// $gt: Greater than
//
// $gte: Greater than or equal to
//
// $lt: Less than
//
// $lte: Less than or equal to
export const META_DATA_EDITOR_TOOLTIP_TEXT = (
    <>
        <h4>Supported Operations</h4>
        <ul className="list-disc pl-4 space-y-1 pt-2 pb-2">
            <li>
                <b className="text-blue-500">$eq - </b> Equal to (same as direct value comparison)
            </li>
            <li>
                <b className="text-blue-500">$ne- </b> Not equal to
            </li>
            <li>
                <b className="text-blue-500">$gt - </b> Greater than
            </li>
            <li>
                <b className="text-blue-500">$gte - </b> Greater than or equal to
            </li>
            <li>
                <b className="text-blue-500">$lt - </b> Less than
            </li>
            <li>
                <b className="text-blue-500">$lte - </b> Less than or equal to
            </li>
        </ul>
        <span className="text-red-600"> Note: OR, AND, and NOT operators are not supported.</span>
    </>
);
