import { useId } from "react";
/** Original font silhouette revealed by a closely fitted pen mask. */
export function CoastalAmpersand() {
  const mask = useId();
  return (
    <svg
      className="coastal-ampersand"
      viewBox="0 -820 820 850"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <mask
          id={mask}
          maskUnits="userSpaceOnUse"
          x="-50"
          y="-850"
          width="920"
          height="950"
          style={{ maskType: "luminance" }}
        >
          <path
            className="coastal-ampersand-ink"
            transform="scale(1 -1)"
            d="M790 90 C748 10 680 -5 610 30 C460 100 240 410 215 600 C195 740 275 780 340 744 C425 695 428 578 332 500 C245 429 120 373 78 260 C20 104 146 -9 305 12 C480 35 630 196 630 324 C630 420 549 463 478 453 C423 445 397 402 410 345 C385 434 453 472 531 462 C641 447 736 495 766 593 C797 695 746 787 685 788 C637 789 612 751 645 733"
            fill="none"
            stroke="white"
            strokeWidth="110"
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      <g data-ink-mask={mask}>
        <path
          transform="scale(1 -1)"
          fill="currentColor"
          d="M217 395C269 284 376 126 469 47C421 19 366 5 311 5C184 5 104 102 106 215C108 287 137 343 217 395ZM277 450C248 520 234 590 244 654C250 695 267 738 316 738C367 738 375 675 372 626C370 595 368 510 277 450ZM404 332C404 332 418 337 415 344C396 388 409 418 459 426C482 430 504 427 528 425C567 406 595 354 597 297C600 209 572 142 528 94C438 174 335 319 287 427C387 481 444 553 444 626C445 705 393 756 320 756C237 756 185 707 169 627C157 568 171 497 207 416C81 358 32 291 25 204C15 73 127 -21 299 -22C369 -22 434 -2 490 31C535 -2 584 -23 638 -23C719 -23 774 15 805 91L793 94C768 46 735 22 681 22C638 22 595 41 551 75C622 138 666 225 665 316C665 355 651 399 629 428C634 429 638 431 642 432C789 485 795 646 758 714C730 784 687 809 652 809C628 809 612 798 602 775C587 735 619 703 647 703C652 703 658 705 663 708C675 717 692 725 707 725C726 725 744 713 752 676C776 551 693 502 626 491C594 485 564 488 532 488C502 488 471 486 436 471C381 448 369 380 404 332Z"
        />
      </g>
    </svg>
  );
}
